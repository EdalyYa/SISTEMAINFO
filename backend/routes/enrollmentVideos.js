const express = require('express');
const router = express.Router();

const enrollmentVideos = [
  {
    nombre: 'INFOUNA',
    url: 'https://www.youtube.com/embed/XXXXXXXXXXX',
    descripcion: 'Aprende cómo matricularte en INFOUNA paso a paso.'
  },
  {
    nombre: 'INFOUNA',
    url: 'https://www.youtube.com/embed/YYYYYYYYYYY',
    descripcion: 'Descubre los requisitos para matricularte en nuestros cursos.'
  },
];

router.get('/', (req, res) => {
  res.json(enrollmentVideos);
});

module.exports = router;
