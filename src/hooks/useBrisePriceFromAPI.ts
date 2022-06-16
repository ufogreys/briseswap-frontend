import { useState, useEffect } from 'react'
import BigNumber from 'bignumber.js'
import useRefresh from './useRefresh'


const useBrisePriceFromAPI = () => {

    const [brisePrice, setBrisePrice] = useState<BigNumber | null>(null)
    const { fastRefresh } = useRefresh()

    useEffect(() => {
        
        const fetchBrisePriceData = async () => {
            const apiUrl = process.env.REACT_APP_NODESERVER
            const response = await fetch(`${apiUrl}/getbriseprice`)
            const data = await response.json()
            setBrisePrice(new BigNumber(data.price))
            
        }

        fetchBrisePriceData()
    }, [fastRefresh])

    return brisePrice
}

export default useBrisePriceFromAPI