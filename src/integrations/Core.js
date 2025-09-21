// This file connects to your FastAPI Gemini backend for text generation.

export const InvokeLLM = async ({ prompt, response_json_schema }) => {
  try {
    const res = await fetch("http://localhost:8000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    return data.result || "No response from Gemini model.";
  } catch (err) {
    return "Error connecting to Gemini backend.";
  }
};

// The file upload mock remains unchanged.
export const UploadFile = async ({ file }) => {
  console.log("MOCK: Uploading file:", file.name);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload delay

  // Create a temporary URL for the image preview
  const file_url = URL.createObjectURL(file);

  return { file_url };
};