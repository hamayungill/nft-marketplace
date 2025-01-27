const express = require('express')
const categoryRoutes = require('./categories.route')
const userRoutes = require('./users.route')
const adminRoutes = require('./admin.route')
const nftsRoutes = require('./nfts.route')
const emailRoutes = require('./email.route')
const settingsRoutes = require('./settings.route')
const ingredientRoutes=require('./Ingredients.route')
const faqRoutes = require('./faq.route')
const pizzaRoutes = require('./pizza.route')
const artistRoutes = require('./artist.route')
const rarityRewardRoutes = require('./rarityReward.route')

const router = express.Router()

/**
 * GET v1/admin
 */
router.use('/staff', adminRoutes)
router.use('/category', categoryRoutes)
router.use('/ingredient',ingredientRoutes)
router.use('/faq',faqRoutes)
router.use('/user', userRoutes)
router.use('/nfts', nftsRoutes)
router.use('/email', emailRoutes)
router.use('/settings', settingsRoutes)
router.use('/pizza', pizzaRoutes)
router.use('/artist', artistRoutes)
router.use('/rarity-reward', rarityRewardRoutes)

module.exports = router
