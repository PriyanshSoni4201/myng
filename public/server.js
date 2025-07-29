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

    // Step 1: Set the HTML content. We still use 'load' as a good starting point.
    await page.setContent(html, { waitUntil: "load" });

    // Step 2: THE CRITICAL FIX - Explicitly wait for all images to be fully rendered.
    // This function runs inside the browser and tells Puppeteer to wait until
    // every single <img> tag has finished decoding and has a real size.
    await page.waitForFunction(
      () =>
        Array.from(document.querySelectorAll("img")).every(
          (img) => img.complete && img.naturalWidth > 0
        ),
      { timeout: 10000 }
    ); // Add a generous timeout of 10 seconds

    // Step 3: Now that we are certain the images are rendered, generate the PDF.
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    // Provide more detailed error feedback to the client
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
