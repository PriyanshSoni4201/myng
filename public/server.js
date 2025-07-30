// server.ts
import express from "express";
import puppeteer from "puppeteer";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.post("/api/generate-pdf", async (req, res) => {
  try {
    const { html } = req.body;
    if (!html) {
      return res.status(400).send("HTML content is missing.");
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Set content and wait for network to be idle
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Wait for all images to be loaded
    await page.waitForFunction(
      () =>
        Array.from(document.querySelectorAll("img")).every(
          (img) => img.complete && img.naturalWidth > 0
        ),
      { timeout: 10000 }
    );

    // Generate PDF, Puppeteer will automatically paginate based on page-break-after and element sizes
    const pdfBuffer = await page.pdf({
      format: "A4", // This format can be explicitly set based on the request body if needed, but the HTML will drive the layout.
      printBackground: true,
      // margin: { // Margins can be set here if the HTML doesn't account for them via padding/positioning
      //   top: '0',
      //   right: '0',
      //   bottom: '0',
      //   left: '0',
      // },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    if (error instanceof puppeteer.TimeoutError) {
      res
        .status(500)
        .send(
          "Failed to generate PDF: Timed out while waiting for images to render."
        );
    } else {
      res.status(500).send("Failed to generate PDF");
    }
  }
});

app.listen(port, () => {
  console.log(`PDF generation server listening on port ${port}`);
});
