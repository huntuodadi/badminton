const axios = require('axios');
const argParser = require('minimist');
const { expectedDate, startDate, place } = argParser(process.argv);

if (!expectedDate || !startDate || !place) {
  console.log('\x1b[31m', 'command should be like: node xx.js --expectedDate=2021-12-28 --startDate=2021-12-27 --place=90', '\x1b[0m')
  process.exit(1)
}

// 开始时间
const startTime = `${startDate} 12:00:00`;

const token = '5a027866676515f15ff67965e0fb04ad';

const order = () => {
  axios.get(`https://shgypsapi.linkingfit.club/api/v1/booking/place/time?service_id=2857&place_ids=${place}&date=${expectedDate}`)
  .then(res => {
    console.log('res:', res)
    const { place_id, place_time: sessions} = res.data.data[0];
    const matchedSessions = sessions.filter(session => {
      return session.start_time.indexOf('20:00:00') > -1 || session.start_time.indexOf('21:00:00') > -1
    })
    console.log('matchedSessions:', matchedSessions)
    const totalPrice = matchedSessions.reduce((sum, current) => {
      return sum += current.price;
    }, 0);
    const place_time = [{
      place_id: place,
      time_id: matchedSessions.map(item => item.id)
    }];
    const payload = {
      "pay_type": 0,
      "business_id": 39,
      "title": "羽毛球馆",
      "amount": totalPrice,
      "total_price": totalPrice,
      "coupon_ids": [],
      "service_id": 2857,
      "type": 4,
      "place_time": place_time,
      "location": "31.224184036254883,121.3460464477539"
    }

    axios.post('https://shgypsapi.linkingfit.club/api/v1/user/order', payload, {
      headers: { token }
    }).then(res => {
      console.log('order res:', res.data)
      process.exit(1)
    })
  })
}

let timer;
const countTime = () => {
  const timeGap = new Date(startTime).getTime() - Date.now();
  if (timeGap > 1000) {
    timer = setTimeout(() => {
      console.log('程序生效中，等待设定时间抵达...')
      clearTimeout(timer);
      countTime();
    }, 1000)
  }
  else {
    setTimeout(() => {
      console.log('时间到，action');
      order();
    }, timeGap)
  }
}

countTime();
