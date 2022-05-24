import { ContextApi } from 'contexts/Localization/types'
import { PageMeta } from './types'

export const DEFAULT_META: PageMeta = {
  title: 'BriseSwap',
  description:
    'The AMM you can trust on the BitGert network. Bringing you the true meaning of DeFi. Trade and farm tokens, passively, on our platform.',
  image: 'https://briseswap.finance/images/hero.png',
}

export const getCustomMeta = (path: string, t: ContextApi['t']): PageMeta => {
  switch (path) {
    case '/':
      return {
        title: `${t('Home')} | ${t('BriseSwap')}`,
      }
    case '/competition':
      return {
        title: `${t('Trading Battle')} | ${t('BriseSwap')}`,
      }
    case '/prediction':
      return {
        title: `${t('Prediction')} | ${t('BriseSwap')}`,
      }
    case '/farms':
      return {
        title: `${t('Farms')} | ${t('BriseSwap')}`,
      }
    case '/pools':
      return {
        title: `${t('Pools')} | ${t('BriseSwap')}`,
      }
    case '/lottery':
      return {
        title: `${t('Lottery')} | ${t('BriseSwap')}`,
      }
    case '/collectibles':
      return {
        title: `${t('Collectibles')} | ${t('BriseSwap')}`,
      }
    case '/ifo':
      return {
        title: `${t('Initial Farm Offering')} | ${t('BriseSwap')}`,
      }
    case '/teams':
      return {
        title: `${t('Leaderboard')} | ${t('BriseSwap')}`,
      }
    case '/profile/tasks':
      return {
        title: `${t('Task Center')} | ${t('BriseSwap')}`,
      }
    case '/profile':
      return {
        title: `${t('Your Profile')} | ${t('BriseSwap')}`,
      }
    default:
      return null
  }
}
