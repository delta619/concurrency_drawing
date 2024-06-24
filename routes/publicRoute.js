const router = require('express').Router();
const statsController = require('../controller/StatsController');

router.route('/create').post(statsController.create_screen)
router.route('/update/').post(statsController.update_screen)
router.route('/wait/').post(statsController.wait)
router.route('/snapshot/').post(statsController.snapshot)
router.route('/clear/').post(statsController.clear)

module.exports = router