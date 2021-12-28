const axios = require('axios');
const argParser = require('minimist');
const { expectedDate, startDate } = argParser(process.argv);

let timeStamp;

const places = [82, 83, 84, 85, 86, 87, 88, 89, 90, 91];

if (!expectedDate || !startDate) {
  console.log('\x1b[31m', 'command should be like: node jingan.js --expectedDate=2021-12-30 --startDate=2021-12-24', '\x1b[0m')
  process.exit(1)
}

// 开始时间
const startTime = `${startDate} 12:00:00`;

const token = '5a027866676515f15ff67965e0fb04ad';

const order = (currentPlace) => {
  axios.get(`https://shgypsapi.linkingfit.club/api/v1/booking/place/time?service_id=2857&place_ids=${currentPlace}&date=${expectedDate}`)
  .then(res => {
    if (!res.data || !res.data.data) {
      console.log(`重试 第${currentPlace}场地`)
      order(currentPlace);
      return;
    }
    const { place_id, place_time: sessions} = res.data.data[0];
    const matchedSessions = sessions.filter(session => {
      return session.status === 1 && (session.start_time.indexOf('20:00:00') > -1 || session.start_time.indexOf('21:00:00') > -1)
    })
    if (matchedSessions.length < 2) {
      console.log(`场次${currentPlace}没有剩余场地, 耗时 ${Date.now() - timeStamp}ms`)
      order(currentPlace - 1);
    }
    const totalPrice = matchedSessions.reduce((sum, current) => {
      return sum += current.price;
    }, 0);
    const place_time = [{
      place_id: currentPlace,
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
      "place_time": [{
        place_id: currentPlace,
        time_id: matchedSessions.map(item => item.id)
      }],
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

const justOrder = () => {
  const payload = {
    "pay_type": 0,
    "business_id": 39,
    "title": "羽毛球馆",
    "amount": 80,
    "total_price": 80,
    "coupon_ids": [],
    "service_id": 2857,
    "type": 4,
    "place_time": [{
      place_id: 91,
      time_id: [114274]
    }],
    "location": "31.224184036254883,121.3460464477539"
  }
  axios.post('https://shgypsapi.linkingfit.club/api/v1/user/order', payload, {
    headers: { token }
  }).then(res => {
    console.log('order res:', res.data)
    return
  })
}

const timeGap = new Date(startTime).getTime() - Date.now();

setTimeout(() => {
  console.log('3s')
  setInterval(() => {
    justOrder()
  }, 50)
}, timeGap - 3 * 1000)

// let timer;
// const countTime = () => {
//   const timeGap = new Date(startTime).getTime() - Date.now();
//   if (timeGap > 1000) {
//     timer = setTimeout(() => {
//       clearTimeout(timer);
//       countTime();
//     }, 1000)
//   }
//   else {
//     setTimeout(() => {
//       console.log('时间到，action');
//       timeStamp = Date.now();
//       // places.forEach(item => order(item))
//       justOrder();
//     }, timeGap)
//   }
// }

// countTime();
