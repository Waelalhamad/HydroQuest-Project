const {Router} = require('express')
const router = Router()

// Define routes for the dashboard and components


router.get("/" , (req , res) => {
  res.render("index")
})
router.get('/dashboard', (req, res) => {
  const user = req.user
  res.render('dashboard' , {user});
});

router.get('/dashboard/video', (req, res) => {
  res.render('./components/camera');
});

router.get('/dashboard/location', (req, res) => {
  res.render('./components/location');
});

router.get('/dashboard/sensors', (req, res) => {
  res.render('./components/sensors');
});


module.exports = router;
