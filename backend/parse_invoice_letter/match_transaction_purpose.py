from django.db import connection
from utils.set_up_django_env import set_up_django_env

set_up_django_env()


class MatchTransactionPurpose:
    def __init__(self):
        self.app_prefix = "dinoapi_"
        self.tables = [
            {
                "store_table": f"{self.app_prefix}income",
                "purpose_table": f"{self.app_prefix}incomepurpose",
                "income": True,
            },
            {
                "store_table": f"{self.app_prefix}expenditure",
                "purpose_table": f"{self.app_prefix}expenditurepurpose",
            },
        ]

    def get_matched_purpose(self, store_table, purpose_table, income):
        """
        Store the matched purpose for a given transaction description and purpose.
        """
        transaction_table = f"{self.app_prefix}transaction"
        with connection.cursor() as cursor:
            # 1. INSERT INTO: Inserts data into store_table with columns:
            #     - transaction_id, purpose_id (always)
            #     - source (only for income transactions)
            # 2. SELECT DISTINCT ON (t.id): Returns only the first match per transaction ID after ordering
            # 3. Pattern Matching:
            #     - LEFT JOIN ... ON lower(t.description) ~ lower(p.pattern) uses regex (~) to match transaction descriptions against purpose patterns (case-insensitive)
            # 4. Conditional Logic:
            #     - Income (amount >= 0): Extracts source from description using split_part(t.description, ' - ', 1) (gets text before first " - ")
            #     - Expenses (amount < 0): No source extraction
            # 5. ORDER BY t.id, p.id: Ensures consistent selection when multiple purposes match (picks lowest purpose ID)
            # 6. ON CONFLICT: If transaction_id already exists, updates the purpose_id instead of failing
            cursor.execute(
                f"""
            INSERT INTO {store_table} (transaction_id, purpose_id{", source" if income is True else ""})
            SELECT DISTINCT ON (t.id) t.id, p.id{", split_part(t.description, ' - ', 1)" if income is True else ""}
            FROM {transaction_table} t
            LEFT JOIN {purpose_table} p ON lower(t.description) ~ lower(p.pattern)
            WHERE t.amount {">= 0" if income is True else "< 0"}
            ORDER BY t.id, p.id
            ON CONFLICT (transaction_id) 
            DO UPDATE SET purpose_id = EXCLUDED.purpose_id;
                """
            )

    def process_match(self):
        for table in self.tables:
            self.get_matched_purpose(
                table["store_table"], table["purpose_table"], table.get("income", False)
            )
            print(
                f"Matched purposes for {table['store_table']} and {table['purpose_table']}"
            )


if __name__ == "__main__":
    # This process can only be executed after data about transactions and purposes has been initialized,
    # because it needs to match the transaction descriptions with the purpose patterns to store the matched purpose for each transaction
    match_obj = MatchTransactionPurpose()
    match_obj.process_match()
