const express = require('express')
const authRoutes = require('./auth.route')
const categoryRoutes = require('./category.route')
const ingredientRoutes=require('./ingredient.route')
const nftsRoutes = require('./nfts.route')
const usersRoutes = require('./users.route')
const settingsRoutes = require('./settings.route')
const faqRoutes = require('./faq.route')
const pizzaRoutes = require('./pizza.route')
const artistRoutes = require('./artist.route')
const rarityRewardRoutes = require('./rarityReward.route')

const router = express.Router()
/**
 * GET v1/status
 */
router.use('/auth', authRoutes)
router.use('/category', categoryRoutes)
router.use('/ingredient', ingredientRoutes)
router.use('/nfts', nftsRoutes)
router.use('/faq',faqRoutes)
router.use('/users', usersRoutes)
router.use('/settings', settingsRoutes)
router.use('/pizza', pizzaRoutes)
router.use('/artist', artistRoutes)
router.use('/rarity-reward', rarityRewardRoutes)

module.exports = router
