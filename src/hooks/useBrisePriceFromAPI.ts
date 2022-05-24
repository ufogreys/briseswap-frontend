import { useState, useEffect } from 'react';
import useRefresh from './useRefresh'


const useBrisePriceFromAPI = () => {

    const [brisePrice, setBrisePrice] = useState<number | null>(null)
    const { fastRefresh } = useRefresh()

    useEffect(() => {
        const params = {
            slug: 'bitrise-token',
            convert: 'USD'
        }
        const fetchBrisePriceData = async () => {

            const url = 'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?'
            const CMC_API_KEY =  '91fd98c5-6cfa-487c-8a1e-73d4f4fb27e9'
            
            const response = await fetch(url + new URLSearchParams(params).toString(), {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CMC_PRO_API_KEY': CMC_API_KEY,
                },
            })
            const data = await response.json()
            console.log('CMC data: ', data)
            setBrisePrice(data.data['1'].quote.USD.price)
            
        }

        fetchBrisePriceData()
    }, [fastRefresh])

    return brisePrice
}

export default useBrisePriceFromAPI