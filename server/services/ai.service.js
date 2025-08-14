// server/services/ai.service.js (Cohere Version)
const { CohereClient } = require('cohere-ai');

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

function parseUrlForTitle(url) {
  try {
    const urlObject = new URL(url);
    let domain = urlObject.hostname.replace(/^www\./, '');
    const mainDomain = domain.split('.')[0];
    let path = urlObject.pathname.replace(/^\/|\/$/g, '');
    const lastSegment = path.split('/').pop();
    let cleanSegment = '';
    if (lastSegment) {
      cleanSegment = lastSegment.replace(/[-_]/g, ' ').replace(/\.(html|htm|php|aspx|jsp)$/, '');
    }
    const baseTitle = cleanSegment ? `${mainDomain}: ${cleanSegment}` : mainDomain;
    return baseTitle.charAt(0).toUpperCase() + baseTitle.slice(1);
  } catch (error) {
    return 'Untitled Link';
  }
}

async function generateTitleFromUrl(url) {
  const baselineTitle = parseUrlForTitle(url);
  try {
    const response = await cohere.chat({
      model: "command-r",
      preamble: "You are an expert copywriter. Refine a simple, machine-generated title to be more engaging and human-readable, using the full URL for context. The final title must be no more than 10 words.",
      message: `Refine the title for the URL "${url}". The simple title is: "${baselineTitle}"`,
      temperature: 0.75,
      maxTokens: 30,
    });
    const aiTitle = response.text.trim().replace(/"/g, '');
    console.log(`Cohere Success! AI Title: "${aiTitle}"`);
    return aiTitle || baselineTitle;
  } catch (error) {
    console.error("Cohere title enhancement failed:", error.message);
    console.log(`Cohere failed, falling back to parsed title: "${baselineTitle}"`);
    return baselineTitle;
  }
}

module.exports = { generateTitleFromUrl };