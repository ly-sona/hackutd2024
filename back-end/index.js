const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import the OpenAI package
const OpenAI = require('openai');

// Create a configuration with your API key
const configuration = new OpenAI.Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create an OpenAI API client
const openai = new OpenAI.OpenAIApi(configuration);

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate-risk-analysis', async (req, res) => {
  const customerData = req.body;

  // Prepare the messages array with customer data
  const messages = generateMessages(customerData);

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo', // Use 'gpt-3.5-turbo' if you don't have access to 'gpt-4'
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    res.json({ analysis: completion.data.choices[0].message.content.trim() });
  } catch (error) {
    console.error(
      'Error generating analysis:',
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: 'Failed to generate analysis' });
  }
});

const generateMessages = (data) => {
  // Construct the messages array using customer data
  return [
    {
      role: 'system',
      content:
        'You are a financial advisor who provides detailed loan risk analyses based on customer information.',
    },
    {
      role: 'user',
      content: `
        Based on the following customer information, provide a detailed analysis of their loan risk score. Explain why their risk score is low or high, using specific examples from their data.

        Customer Information:
        Name: ${data.name}
        Age Group: ${data.ageGroup}
        Marital Status: ${data.maritalStatus}
        Dependents: ${data.dependents}
        Employment Status: ${data.employmentStatus}
        Income Bracket: ${data.incomeBracket}
        Savings Amount: ${data.savingsAmount}
        Monthly Expenses:
          Rent/Mortgage: ${data.monthlyExpenses.rent}
          Utilities: ${data.monthlyExpenses.utilities}
          Insurance: ${data.monthlyExpenses.insurance}
          Loan Payments: ${data.monthlyExpenses.loanPayments}
          Subscriptions: ${data.monthlyExpenses.subscriptions}
          Food Costs: ${data.monthlyExpenses.foodCosts}
          Miscellaneous Costs: ${data.monthlyExpenses.miscCosts}
        Desired Loan Details:
          Amount: ${data.desiredLoanAmount}
          APR: ${data.desiredLoanAPR}%
          Period: ${data.desiredLoanPeriod} months
      `,
    },
  ];
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
