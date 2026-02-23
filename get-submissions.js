exports.handler = async function(event, context) {
  const token = process.env.NETLIFY_TOKEN;
  const siteId = process.env.SITE_ID2;

  if (!token || !siteId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing NETLIFY_TOKEN or SITE_ID2 environment variables' })
    };
  }

  try {
    // Fetch all forms for the site and find the one named 'guestbook'
    const formsRes = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/forms`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const forms = await formsRes.json();
    const form = forms.find(f => f.name === 'guestbook');

    if (!form) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Form "guestbook" not found' }) };
    }

    // Get submissions for that form
    const subsRes = await fetch(`https://api.netlify.com/api/v1/forms/${form.id}/submissions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const submissions = await subsRes.json();

    // Normalize to the fields we care about
    const normalized = submissions.map(s => ({
      name: s.data.name || '',
      location: s.data.location || '',
      message: s.data.message || '',
      created_at: s.created_at || s.date || null
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalized)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
