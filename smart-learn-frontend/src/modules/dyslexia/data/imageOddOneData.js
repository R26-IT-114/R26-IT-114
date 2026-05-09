// imageOddOneData.js
// Data for Odd One Out game: find the different image among similar ones

const imageOddOneData = [
  {
    id: 1,
    images: [
      require('../assets/images/same/leftcarrot.png'),
      require('../assets/images/same/leftcarrot.png'),
      require('../assets/images/same/leftcarrot.png'),
      require('../assets/images/same/rightcarrot.png'), // odd one
      require('../assets/images/same/leftcarrot.png'),
    ],
    oddIndex: 3,
    name: 'කැරට්',
  },
  {
    id: 2,
    images: [
      require('../assets/images/same/orange.png'),
      require('../assets/images/same/orange.png'),
      require('../assets/images/same/orange.png'),
      require('../assets/images/same/rigfht orrange.png'), // odd one
      require('../assets/images/same/orange.png'),
    ],
    oddIndex: 3,
    name: 'දොඩම්',
  },
  {
    id: 3,
    images: [
      require('../assets/images/same/leftgiraf.png'),
      require('../assets/images/same/leftgiraf.png'),
      require('../assets/images/same/leftgiraf.png'),
      require('../assets/images/same/rightgiraf.png'), // odd one
      require('../assets/images/same/leftgiraf.png'),
    ],
    oddIndex: 3,
    name: 'ජිරාෆ්',
  },
  {
    id: 4,
    images: [
      require('../assets/images/same/leftflower.png'),
      require('../assets/images/same/leftflower.png'),
      require('../assets/images/same/leftflower.png'),
      require('../assets/images/same/dowflower.png'), // odd one
      require('../assets/images/same/leftflower.png'),
    ],
    oddIndex: 3,
    name: 'මල්',
  },
];

export default imageOddOneData;
