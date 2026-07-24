const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/payout/preview', {
      amount: 1000,
      phoneNumber: "255755123456",
      orderReference: "PF12345678",
      currency: "TZS"
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}

test();
