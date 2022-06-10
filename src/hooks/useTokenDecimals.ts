import { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'
import { getBep20Contract } from 'utils/contractHelpers'
import { BIG_ZERO } from 'utils/bigNumber'
import { FetchStatus } from './useTokenBalance'
import useWeb3 from './useWeb3'
// import useRefresh from './useRefresh'


type UseTokenDecimalsState = {
    decimals: BigNumber
    fetchStatus: FetchStatus
}

const useTokenDecimals = (tokenAddress: string) => {
    const { NOT_FETCHED, SUCCESS, FAILED } = FetchStatus
    const [decimalsState, setDecimalsState] = useState<UseTokenDecimalsState>({
        decimals: BIG_ZERO,
        fetchStatus: NOT_FETCHED,
    })
    const web3 = useWeb3()
    const { account } = useWeb3React()
    // const { fastRefresh } = useRefresh()

    useEffect(() => {
        const fetchDecimals = async () => {
        const contract = getBep20Contract(tokenAddress, web3)
        try {
            const res = await contract.methods.decimals().call({gasPrice: "0"})
            setDecimalsState({ decimals: new BigNumber(res), fetchStatus: SUCCESS })
        } catch (e) {
            console.error(e)
            setDecimalsState((prev) => ({
            ...prev,
            fetchStatus: FAILED,
            }))
        }
        }

        if (account) {
            fetchDecimals()
        }
    }, [account, tokenAddress, web3, SUCCESS, FAILED])

    return decimalsState
}

export default useTokenDecimals
