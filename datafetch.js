function fetchAndParse(items_list, cities) {
    let promises = [];
    let items = {};

    for(let i = 0; i < Math.ceil(Object.keys(items_list).length / 10); i++ ){
//    for(let i = 0; i < 10; i++ ){
        let itemIds = Object.keys(items_list).slice(i*10, (i+1)*10).join(',');
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
                let id = data.item_id + `___${data.quality}`;
                if(!items[id]) {
                    items[id] = JSON.parse(JSON.stringify(items_list[data.item_id]));
                }
                items[id].quality = data.quality;
//                if(items[id]){
                    if(!items[id].sell_price_min_date || new Date(items[id].sell_price_min_date) < new Date(data.sell_price_min_date)) {
                        items[id].sell_price_min_date = data.sell_price_min_date;
                        items[id].sell_price_min[data.city] = data.sell_price_min;
                    }

                    if(!items[id].sell_price_max_date || new Date(items[id].sell_price_max_date) < new Date(data.sell_price_max_date)) {
                        items[id].sell_price_max_date = data.sell_price_max_date;
                        items[id].sell_price_max[data.city] = data.sell_price_max;
                    }

                    if(!items[id].buy_price_max_date || new Date(items[id].buy_price_max_date) < new Date(data.buy_price_max_date)) {
                        items[id].buy_price_max_date = data.buy_price_max_date;
                        items[id].buy_price_max[data.city] = data.buy_price_max;
                    }

                    if(!items[id].buy_price_min_date || new Date(items[id].buy_price_min_date) < new Date(data.buy_price_min_date)) {
                        items[id].buy_price_min_date = data.buy_price_min_date;
                        items[id].buy_price_min[data.city] = data.buy_price_min;
                    }

                    items[id].originalId = data.item_id;
                    items[id].fulldump = items[id].fulldump || "";
                    items[id].fulldump = items[id].fulldump += JSON.stringify(data, null, 2);
//                }
            })
            let profit = [];
            Object.keys(items).forEach(itemKey=> {
                if(Object.keys(items[itemKey].buy_price_max).length > 1 && Object.keys(items[itemKey].sell_price_min).length > 1 ) {
                    const cityFrom = Object.keys(items[itemKey].sell_price_min).reduce((a, b) => items[itemKey].sell_price_min[a] < items[itemKey].sell_price_min[b] && items[itemKey].sell_price_min[a] > 0 ? a : b);
                    const cityTo = Object.keys(items[itemKey].buy_price_max).reduce((a, b) => items[itemKey].buy_price_max[a] > items[itemKey].buy_price_max[b] ? a : b);
                    const profitVal = (items[itemKey].buy_price_max[cityTo] && items[itemKey].sell_price_min[cityFrom] )? Math.round(((items[itemKey].buy_price_max[cityTo] / items[itemKey].sell_price_min[cityFrom]) * 100 - 100)) : null;
                    if(cityFrom !== cityTo &&  profitVal > 0) {
                        profit.push({
                            name: items[itemKey].name,
                            quality: items[itemKey].quality,
                            id: itemKey, //items[itemKey].originalId
                            from: cityFrom,
                            from_sell_price: items[itemKey].sell_price_min[cityFrom],
                            to: cityTo,
                            to_buy_price: items[itemKey].buy_price_max[cityTo],
                            profit_percent: profitVal,
                            price_diff: items[itemKey].buy_price_max[cityTo] - items[itemKey].sell_price_min[cityFrom],
                            fulldump: items[itemKey].fulldump
                        });
                    }
                }
            });
            resolve(profit.sort( (a,b) => b.profit_percent - a.profit_percent));
        });
    });
}
