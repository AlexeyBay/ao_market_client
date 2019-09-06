var CustomNumber = function (config) {
    jsGrid.Field.call(this, config);
};

CustomNumber.prototype = new jsGrid.Field({
    css: "custom-number",
    sorter: function (val1, val2) {
        val1 = val1 || 0;
        val2 = val2 || 0;
        return new Number(val1) - new Number(val2);
    },

    filterTemplate: function () {
        this._from = $("<input type='number' name='from' value='0'  class='number-range'>");
        this._to = $("<input type='number' name='to' value='999999999' class='number-range'>");
        let search = (e) => {
            if (e.which === 13) {
                this._grid.search();
                e.preventDefault();
            }
        }
        this._from.on("keypress", search);
        this._to.on("keypress", search);
        return $("<div>").append(this._from).append(this._to);
    },

    filterValue: function () {
        return {
            from: parseFloat(this._from[0].value) || 0,
            to: parseFloat(this._to[0].value) || 0,
            type: 'numberRange'
        }
    }
});

var PreString = function (config) {
    jsGrid.Field.call(this, config);
};

PreString.prototype = new jsGrid.Field({
    css: "pre-field"
});

var TierValue = function (config) {
    jsGrid.Field.call(this, config);
};

TierValue.prototype = new jsGrid.Field({
    cellRenderer: function(val) {
        return ($(`<td class="tier_${(parseFloat(val)*10)%10}">${val}</td>`))
    },
    align: "right"
});


var HiddenText = function (config) {
    jsGrid.Field.call(this, config);
};

HiddenText.prototype = new jsGrid.Field({
    css: "hidden-text",
    itemTemplate: function (val) {
        return $(`<div class="expandable-block">${val}</div>`);
    }
});

jsGrid.fields.customNumber = CustomNumber;
jsGrid.fields.preString = PreString;
jsGrid.fields.hiddenText = HiddenText;
jsGrid.fields.tierValue = TierValue;

function drawGrid(data) {
    $("#jsGrid").jsGrid({
        width: "100%",
        height: "100%",
        inserting: false,
        editing: false,
        sorting: true,
        paging: false,
        filtering: true,
        data: data,
        controller: {
            loadData: (filter) => {
                return data.filter(item => {
                    matched = true;
                    Object.keys(filter).forEach(filterKey => {
                        if (filter[filterKey] && filter[filterKey].type === 'numberRange') {
                            matched = matched && (parseFloat(item[filterKey]) >= filter[filterKey].from && parseFloat(item[filterKey]) <= filter[filterKey].to);
                        } else {
                            matched = matched && (item[filterKey].toString().match(new RegExp(filter[filterKey], "gi")));
                        }
                    })
                    return matched;
                });
            }
        },
        fields: [
            {
                name: "name",
                title: "Name",
                type: "text",
                width: 150
            },
            {
                name: "tier",
                title: "Tier",
                type: "tierValue",
                width: 40
            },
            {
                name: "quality",
                title: "Quality",
                type: "number",
                width: 40
            },
            {
                name: "id",
                title: "ID",
                type: "hiddenText",
                width: 40
            },
            {
                name: "from",
                title: "From",
                type: "text",
                width: 80
            },
            {
                name: "from_sell_price",
                title: "FS.price",
                type: "customNumber",
                width: 100
            },
            {
                name: "to",
                title: "To",
                type: "text",
                width: 80
            },
            {
                name: "to_buy_price",
                title: "TB.price",
                type: "customNumber",
                width: 100
            },
            {
                name: "to_sell_price",
                title: "TS.price",
                type: "customNumber",
                width: 100
            },
            {
                name: "profit_percent",
                title: "Profit %",
                type: "customNumber",
                width: 100
            },
            {
                name: "price_diff",
                title: "Profit per item",
                type: "customNumber",
                width: 100
            },
            {
                name: "profit_percent_delayed",
                title: "Profit % (auc)",
                type: "customNumber",
                width: 100
            },
            {
                name: "price_diff_delayed",
                title: "Profit per item (auc)",
                type: "customNumber",
                width: 100
            }/*,
            {
                name: "fulldump",
                title: "fulldump",
                type: "preString",
                width: 375
            }*/
        ]
    });
}
