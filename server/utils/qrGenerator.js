const QRCode = require('qrcode');

const generateQR = async (data) => {
  return await QRCode.toDataURL(data, {
    width: 300,
    margin: 2,
    color: {
      dark: '#0a0f1e',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'M'
  });
};

module.exports = { generateQR };
