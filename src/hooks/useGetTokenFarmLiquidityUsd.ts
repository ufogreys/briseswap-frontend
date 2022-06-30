import { useState, useEffect } from 'react'
import BigNumber from 'bignumber.js'
import { usePriceBnbBusd } from 'state/hooks'
import { BIG_TEN } from 'utils/bigNumber'
import { getAddress } from 'utils/addressHelpers'
import { Address } from 'config/constants/types'

import { useRouterContract } from './useContract'
import useRefresh from './useRefresh'

const wbriseAddress = "0x0eb9036cbE0f052386f36170c6b07eF0a0E3f710"
const amountInBswap = "1000000000000000000"

const useGetTokenFarmLiquidityUsd = (tokenAddress: Address, tokenDecimals: number) => {
    // getAddress
    const [tokenPrice, setTokenPrice] = useState<BigNumber | null>(null)
    const { fastRefresh } = useRefresh()
    
    const brisePriceUSD = usePriceBnbBusd()
    const router = useRouterContract()
    
    useEffect(() => {
        const path = [getAddress(tokenAddress), wbriseAddress]
        const fetchTokenPrice = async() => {
            // const calls = [
            //     // Balance of token in the LP contract
            //     {
            //       address: getAddress(token.address),
            //       name: 'balanceOf',
            //       params: [lpAddress],
            //     },
            //     // Balance of quote token on LP contract
            //     {
            //       address: getAddress(quoteToken.address),
            //       name: 'balanceOf',
            //       params: [lpAddress],
            //     },
            //     // Balance of LP tokens in the master chef contract
            //     {
            //       address: lpAddress,
            //       name: 'balanceOf',
            //       params: [getMasterChefAddress()],
            //     },
            //     // Total supply of LP tokens
            //     {
            //       address: lpAddress,
            //       name: 'totalSupply',
            //     },
            //     // Token decimals
            //     {
            //       address: getAddress(token.address),
            //       name: 'decimals',
            //     },
            //     // Quote token decimals
            //     {
            //       address: getAddress(quoteToken.address),
            //       name: 'decimals',
            //     },
            //   ]
            // const calls = [
            //     {
            //         address: getAddress(tokenAddress),
            //         name: 'balanceOf',
            //         params: [getMasterChefAddress()]
            //     },
            //     {
            //         address: router.options.address,
            //         name: 'getAmountsOut',
            //         params: [amountInBswap, path]
            //     }
            // ]
            // console.log('liquidity here: ', calls)

            const [, priceRaw] = await router.methods.getAmountsOut(amountInBswap, path).call({
                gasPrice: "0"
            })
            setTokenPrice(new BigNumber(priceRaw).div(BIG_TEN.pow(tokenDecimals).times(brisePriceUSD)))

        }

        fetchTokenPrice()
    }, [router, tokenDecimals, tokenAddress, brisePriceUSD, fastRefresh])

    return tokenPrice
}


export default useGetTokenFarmLiquidityUsd