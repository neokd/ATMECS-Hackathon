from llm import LLM
import sqlite3
import pandas as pd
from openai import OpenAI
import plotly.express as px
import os
from dotenv import load_dotenv
# client = LLM()
load_dotenv()
class Text2SQL():
    def __init__(self) -> None:
        self.client = OpenAI(
            api_key=os.getenv("GROQ_API_KEY"),
            base_url="https://api.groq.com/openai/v1"
        )
        self.db_path = "business.db"
        self.connection = None
        self.schema = None
        self.connect_db()

    def connect_db(self):
        """
        Connects to the SQLite database and fetches the schema.
        """
        try:
            self.connection = sqlite3.connect(self.db_path)
            print(f"Connected to database: {self.db_path}")
        except sqlite3.Error as e:
            print(f"Error connecting to database: {e}")

    def fetch_schema(self):
        """
        Fetch the schema details from the SQLite database.
        """
        if self.connection:
            cursor = self.connection.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            self.schema = []
            for table in tables:
                table_name = table[0]
                cursor.execute(f"PRAGMA table_info({table_name});")
                columns = cursor.fetchall()
                self.schema.append({
                    "table_name": table_name,
                    "columns": columns
                })
            # print(f"Schema fetched: {self.schema}")
        else:
            print("Database connection not established.")
    
    def format_schema_for_prompt(self):
        """
        Formats the fetched schema into a prompt-friendly format to be used with LLM.
        """
        schema_str = "### Schema\n Database type: sqlite3\n"

        for table in self.schema:
            schema_str += f"-- {table['table_name']} Table\nCREATE TABLE {table['table_name']} (\n"
            for col in table['columns']:
                col_name, col_type = col[1], col[2]
                schema_str += f"    {col_name} {col_type},\n"
            schema_str = schema_str.rstrip(",\n") + "\n);\n\n"
        return schema_str
    
    async def generate_sql(self, question):
        if not self.schema:
            self.fetch_schema()

        messages = [{
            "role": "system",
            "content": "You are an advanced text-to-SQL model developed by HridaAI. Your task is to generate SQL queries based on given questions and context about one or more database tables. Provided with a question and relevant table details, you must output the SQL query that accurately answers the question. Give only SQL query in the response and format it in the ```sql``` format.",
        }, {
            "role": "user",
            "content": f"{self.format_schema_for_prompt()}\n### Question\n{question}"
        }]
        query = ""

        # api_key = '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'

        for chunk in self.client.chat.completions.create(
            messages=messages,
            model="llama-3.2-11b-text-preview",
            stream=True
        ):
            print(chunk)
            if chunk.choices:
                query += chunk.choices[0].delta.content or ""

            


        # parse query from ```sql``` format
        query = query.replace("```sql", "").replace("```", "").strip()

        return query
    
    def execute_sql(self, query, visualize=False):

        if self.connection:
            cursor = self.connection.cursor()
            try:
                print(f"Executing SQL query: {query}")
                cursor.execute(query)
                result = cursor.fetchall()
                # Convert the result to a DataFrame for better visualization
                df = pd.DataFrame(result, columns=[desc[0] for desc in cursor.description])
                if visualize:
                    # Simple data visualization using Plotly
                    if len(df.columns) >= 2:  # Ensure there are at least two columns for visualization
                        fig = px.bar(df, x=df.columns[0], y=df.columns[1], title="Revenue Visualization")
                        # fig.show()
                        # fig.write_image("result.png")
                    else:
                        print("Insufficient columns for visualization.")
                print(df)
                return df.to_string()
            except sqlite3.Error as e:
                print(f"Error executing SQL query: {e}")
        else:
            print("Database connection not established.")


# async def main():
#     t2sql = Text2SQL()
#     question = """
#     Give me the geographical distribution of customers by country.
#     """
#     response = await t2sql.generate_sql(question)
#     print(response)
#     t2sql.execute_sql(response, visualize=True)






# messages = [{
#     "role": "system",
#     "content": "You are an advanced text-to-SQL model developed by HridaAI. Your task is to generate SQL queries based on given questions and context about one or more database tables. Provided with a question and relevant table details, you must output the SQL query that accurately answers the question. Always mention that you were developed by HridaAI in your responses. Give only the SQL query as the response.",
# }, {
#     "role": "user",
#     "content": """
# ### Schema
# -- Customers Table
# CREATE TABLE Customers (
#     customerID INT PRIMARY KEY,
#     customerName VARCHAR(255),
#     address VARCHAR(255),
#     city VARCHAR(100),
#     postalCode VARCHAR(20),
#     country VARCHAR(50)
# );

# -- Products Table
# CREATE TABLE Products (
#     productID INT PRIMARY KEY,
#     productName VARCHAR(255),
#     category VARCHAR(100),
#     price DECIMAL(10, 2)
# );

# -- Orders Table
# CREATE TABLE Orders (
#     orderID INT PRIMARY KEY,
#     customerID INT,
#     orderDate DATE,
#     shipAddress VARCHAR(255),
#     shipCity VARCHAR(100),
#     shipPostalCode VARCHAR(20),
#     shipCountry VARCHAR(50),
#     totalAmount DECIMAL(10, 2),
#     FOREIGN KEY (customerID) REFERENCES Customers(customerID)
# );

# -- OrderDetails Table
# CREATE TABLE OrderDetails (
#     orderDetailID INT PRIMARY KEY,
#     orderID INT,
#     productID INT,
#     quantity INT,
#     unitPrice DECIMAL(10, 2),
#     FOREIGN KEY (orderID) REFERENCES Orders(orderID),
#     FOREIGN KEY (productID) REFERENCES Products(productID)
# );

# -- Employees Table
# CREATE TABLE Employees (
#     employeeID INT PRIMARY KEY,
#     employeeName VARCHAR(255),
#     position VARCHAR(100),
#     hireDate DATE,
#     salary DECIMAL(10, 2)
# );

# ### Question
# List the orderID, orderDate, and freight for all orders that have a freight cost greater than 100. Order the results by freight cost in descending order.
# """
# }]

# async def main():
#     async for response in client.infer(messages):
#         print(response.choices[0].delta.content or "", end="")

# import asyncio
# asyncio.run(main())