const axios = require('axios');

// 场地 from 82 to 91
const place = 91; 

// 期望抢的时间
const expectedDate = '2021-12-28';

// 开始时间
const startTime = '2021-12-23 12:00:00';

const token = '5a027866676515f15ff67965e0fb04ad';

const order = () => {
  axios.get(`https://shgypsapi.linkingfit.club/api/v1/booking/place/time?service_id=2857&place_ids=${place}&date=${expectedDate}`)
  .then(res => {
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
    })
  })
}

const timeGap = new Date(startTime).getTime() - Date.now();
setTimeout(() => {
  order();
}, timeGap)