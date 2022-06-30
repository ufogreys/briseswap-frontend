import BigNumber from 'bignumber.js'
import masterchefABI from 'config/abi/masterchef.json'
import erc20 from 'config/abi/erc20.json'
import { getAddress, getMasterChefAddress } from 'utils/addressHelpers'
import { getRouterContract } from 'utils/contractHelpers'
import { BIG_TEN, BIG_ZERO } from 'utils/bigNumber'
import multicall from 'utils/multicall'
import { Farm, SerializedBigNumber } from '../types'

type PublicFarmData = {
  tokenAmountMc: SerializedBigNumber
  quoteTokenAmountMc: SerializedBigNumber
  tokenAmountTotal: SerializedBigNumber
  quoteTokenAmountTotal: SerializedBigNumber
  lpTotalInQuoteToken: SerializedBigNumber
  farmTokenTotal: SerializedBigNumber
  lpTokenPriceUsd: SerializedBigNumber
  lpTotalSupply: SerializedBigNumber
  tokenPriceVsQuote: SerializedBigNumber
  poolWeight: SerializedBigNumber
  multiplier: string
}

const wbriseAddress = "0x0eb9036cbE0f052386f36170c6b07eF0a0E3f710"
const wbriseDecimals = 18


const fetchFarm = async (farm: Farm): Promise<PublicFarmData> => {
  try {
    
  
  const { pid, lpAddresses, token, quoteToken } = farm
  
  const lpAddress = getAddress(lpAddresses)
  const calls = [
    // Balance of token in the LP contract
    {
      address: getAddress(token.address),
      name: 'balanceOf',
      params: [lpAddress],
    },
    // Balance of quote token on LP contract
    {
      address: getAddress(quoteToken.address),
      name: 'balanceOf',
      params: [lpAddress],
    },
    // Balance of LP tokens in the master chef contract
    {
      address: lpAddress,
      name: 'balanceOf',
      params: [getMasterChefAddress()],
    },
    // Total supply of LP tokens
    {
      address: lpAddress,
      name: 'totalSupply',
    },
    // Token decimals
    {
      address: getAddress(token.address),
      name: 'decimals',
    },
    // Quote token decimals
    {
      address: getAddress(quoteToken.address),
      name: 'decimals',
    },
  ]

  const [tokenBalanceLP, quoteTokenBalanceLP, lpTokenBalanceMC, lpTotalSupply, tokenDecimals, quoteTokenDecimals] =
    await multicall(erc20, calls)

  // Ratio in % of LP tokens that are staked in the MC, vs the total number in circulation
  const lpTokenRatio = new BigNumber(lpTokenBalanceMC).div(new BigNumber(lpTotalSupply))
  // console.log(`farm ${farm.pid}: `, lpTokenBalanceMC[0].toNumber())
  const farmTokenTotal = new BigNumber(lpTokenBalanceMC).div(BIG_TEN.pow(new BigNumber(farm.lpDecimals)))

  // Raw amount of token in the LP, including those not staked
  const tokenAmountTotal = new BigNumber(tokenBalanceLP).div(BIG_TEN.pow(tokenDecimals))
  const quoteTokenAmountTotal = new BigNumber(quoteTokenBalanceLP).div(BIG_TEN.pow(quoteTokenDecimals))

  // Amount of token in the LP that are staked in the MC (i.e amount of token * lp ratio)
  const tokenAmountMc = tokenAmountTotal.times(lpTokenRatio)
  const quoteTokenAmountMc = quoteTokenAmountTotal.times(lpTokenRatio)

  // Total staked in LP, in quote token value
  const lpTotalInQuoteToken = quoteTokenAmountMc.times(new BigNumber(2))

  // For farms that tokens instead of LP tokens. Get token price in Brise via the Router
  const path = [lpAddress, wbriseAddress]
  // const path = [lpAddress, "0xDe14b85cf78F2ADd2E867FEE40575437D5f10c06"]

  const router = getRouterContract()
  let lpTokenPriceInBrise = new BigNumber(0)
  let brisePriceUsd = new BigNumber(0)
  if(!farm.isLpToken){
    const briseAmountIn = "1000000000000000000"
    const [, brisePriceUSDTBN] = await router.methods.getAmountsOut(briseAmountIn, [wbriseAddress, "0xDe14b85cf78F2ADd2E867FEE40575437D5f10c06"]).call({gasPrice: "0"})
    brisePriceUsd =  new BigNumber(brisePriceUSDTBN).div(BIG_TEN.pow(new BigNumber(18)))
    const amountIn = new BigNumber(1).times(BIG_TEN.pow(new BigNumber(farm.lpDecimals)))
    const [farmToken, brisePriceBN] = await router.methods.getAmountsOut(amountIn, path).call({gasPrice: "0"})
    lpTokenPriceInBrise = new BigNumber(brisePriceBN).div(BIG_TEN.pow(new BigNumber(wbriseDecimals)))
    // lpTokenPriceInBrise = new BigNumber(brisePriceBN).div(BIG_TEN.pow(new BigNumber(18)))
  }
  const lpTokenPriceUsd = lpTokenPriceInBrise.times(brisePriceUsd)
  // const lpTokenPriceUsd = lpTokenPriceInBrise
  
  // Only make masterchef calls if farm has pid
  const [info, totalAllocPoint] =
    pid || pid === 0
      ? await multicall(masterchefABI, [
          {
            address: getMasterChefAddress(),
            name: 'poolInfo',
            params: [pid],
          },
          {
            address: getMasterChefAddress(),
            name: 'totalAllocPoint',
          },
        ])
      : [null, null]

      const allocPoint = info ? new BigNumber(info.allocPoint?._hex) : BIG_ZERO
      const poolWeight = totalAllocPoint ? allocPoint.div(new BigNumber(totalAllocPoint)) : BIG_ZERO

  return {
    tokenAmountMc: tokenAmountMc.toJSON(),
    quoteTokenAmountMc: quoteTokenAmountMc.toJSON(),
    tokenAmountTotal: tokenAmountTotal.toJSON(),
    quoteTokenAmountTotal: quoteTokenAmountTotal.toJSON(),
    farmTokenTotal: new BigNumber(farmTokenTotal).toJSON(),
    lpTokenPriceUsd: lpTokenPriceUsd.toJSON(),
    lpTotalSupply: new BigNumber(lpTotalSupply).toJSON(),
    lpTotalInQuoteToken: lpTotalInQuoteToken.toJSON(),
    tokenPriceVsQuote: quoteTokenAmountTotal.div(tokenAmountTotal).toJSON(),
    poolWeight: poolWeight.toJSON(),
    multiplier: `${allocPoint.div(100).toString()}X`,
  }

} catch (error) {
    return {
      tokenAmountMc: "0",
      quoteTokenAmountMc: "0",
      tokenAmountTotal: "0",
      quoteTokenAmountTotal: "0",
      farmTokenTotal: "0",
      lpTokenPriceUsd: "0",
      lpTotalSupply: "0",
      lpTotalInQuoteToken: "0",
      tokenPriceVsQuote: "0",
      poolWeight: "0",
      multiplier: "0",
    }
}
}

export default fetchFarm
