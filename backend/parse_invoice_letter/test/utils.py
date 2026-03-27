import json


def testResultMappedByMethodJSON(result: dict, method: str):
    return json.dumps(
        {
            method: [
                {price: price_item}
                for price, price_value in result.items()
                for price_item in price_value
                if price_item["method"] == method
            ]
        },
        ensure_ascii=False,
        indent=4,
        sort_keys=True,
    )
