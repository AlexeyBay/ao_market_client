function fetchAndParse(items, cities) {
    let promises = [];

    for(let i = 0; i < Math.ceil(Object.keys(items).length / 10); i++ ){
//    for(let i = 0; i < 13; i++ ){
        let itemIds = Object.keys(items).slice(i*10, (i+1)*10).join(',');
        promises.push(
            fetch(`https://www.albion-online-data.com/api/v2/stats/prices/${itemIds}?locations=${cities}&qualities=0`)
                .then(function(response) {
                    return response.json();
                })
                .catch(()=>[])
        );
    }
    return new Promise(function(resolve, reject) {
        Promise.all(promises).then(function(responses) {
            responses.flat(1).forEach(data => {
                if(items[data.item_id]){
                    items[data.item_id].sell_price_min[data.city] = data.sell_price_min;
                    items[data.item_id].sell_price_max[data.city] = data.sell_price_max;
                    items[data.item_id].buy_price_min[data.city] = data.buy_price_min;
                    items[data.item_id].buy_price_max[data.city] = data.buy_price_max;
                    items[data.item_id].sell_price_min_date = data.sell_price_min_date;
                    items[data.item_id].sell_price_max_date = data.sell_price_max_date;
                    items[data.item_id].buy_price_min_date = data.buy_price_min_date;
                    items[data.item_id].buy_price_max_date = data.buy_price_max_date;
                }
            })
            let profit = [];
            Object.keys(items).forEach(itemKey=> {
                if(Object.keys(items[itemKey].buy_price_max).length > 1 && Object.keys(items[itemKey].sell_price_min).length > 1 ) {
                    const cityFrom = Object.keys(items[itemKey].sell_price_min).reduce((a, b) => items[itemKey].sell_price_min[a] < items[itemKey].sell_price_min[b] ? a : b);
                    const cityTo = Object.keys(items[itemKey].buy_price_max).reduce((a, b) => items[itemKey].buy_price_max[a] > items[itemKey].buy_price_max[b] ? a : b);
                    const profitVal = (items[itemKey].buy_price_max[cityTo] && items[itemKey].sell_price_min[cityFrom] )? Math.round(((items[itemKey].buy_price_max[cityTo] / items[itemKey].sell_price_min[cityFrom]) * 100 - 100)) : null;
                    if(cityFrom !== cityTo &&  profitVal > 0) {
                        profit.push({
                            name: items[itemKey].name,
                            id: itemKey,
                            from: cityFrom,
                            from_sell_price: items[itemKey].sell_price_min[cityFrom],
                            to: cityTo,
                            to_buy_price: items[itemKey].buy_price_max[cityTo],
                            profit_percent: profitVal,
                            price_diff: items[itemKey].buy_price_max[cityTo] - items[itemKey].sell_price_min[cityFrom]
                        });
                    }
                }
            });
            resolve(profit.sort( (a,b) => b.profit_percent - a.profit_percent));
        });
    });
}
