import { useEffect, useState } from "react";

import {
  Card,
  Table,
  Button,
  Modal,
  Input,
  Select,
  DatePicker,
  message,
  Typography,
  Space,
  Tag,
} from "antd";

import dayjs from "dayjs";

import MainLayout from "../components/Layout";

import API from "../services/api";

const { Title } = Typography;

export default function ExpensesPage() {

  const [expenses, setExpenses] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [modalOpen,
    setModalOpen] =
    useState(false);

  // ✅ FORM

  const [category,
    setCategory] =
    useState("salary");

  const [amount,
    setAmount] =
    useState("");

  const [note,
    setNote] =
    useState("");

  const [expenseDate,
    setExpenseDate] =
    useState(dayjs());

  // ✅ FETCH

  const fetchExpenses =
    async () => {

      try {

        setLoading(true);

        const response =
          await API.get(
            "/expenses/"
          );

        setExpenses(
          response.data
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    fetchExpenses();

  }, []);

  // ✅ ADD EXPENSE

  const addExpense =
    async () => {

      if (!amount) {

        message.error(
          "Enter amount"
        );

        return;
      }

      try {

        await API.post(
          "/expenses/",
          {
            category,
            amount,
            note,

            expense_date:
              expenseDate.format(
                "YYYY-MM-DD"
              ),
          }
        );

        message.success(
          "Expense added"
        );

        setModalOpen(false);

        setAmount("");

        setNote("");

        setCategory("salary");

        setExpenseDate(dayjs());

        fetchExpenses();

      } catch (err) {

        console.log(err);

        message.error(
          err?.response?.data?.error
          ||
          "Failed"
        );
      }
    };

  // ✅ TABLE

  const columns = [

    {
      title: "Category",

      dataIndex: "category",

      render: (category) => (

        <Tag color="blue">
          {category.toUpperCase()}
        </Tag>

      ),
    },

    {
      title: "Amount",

      dataIndex: "amount",

      render: (amount) => (
        <strong>
          ₹{amount}
        </strong>
      ),
    },

    {
      title: "Date",

      dataIndex:
        "expense_date",
    },

    {
      title: "Note",

      dataIndex: "note",
    },
  ];

  return (

    <MainLayout>

      <div
        style={{
          maxWidth: 1200,
          margin: "20px auto",
        }}
      >

        {/* HEADER */}

        <Space
          style={{
            width: "100%",
            justifyContent:
              "space-between",
            marginBottom: 20,
          }}
        >

          <Title level={2}>
            Expense Management
          </Title>

          <Button

            type="primary"

            onClick={() =>
              setModalOpen(true)
            }
          >

            Add Expense

          </Button>

        </Space>

        {/* TABLE */}

        <Card>

          <Table

            columns={columns}

            dataSource={expenses}

            rowKey="id"

            loading={loading}

            bordered
          />

        </Card>

      </div>

      {/* MODAL */}

      <Modal

        title="Add Expense"

        open={modalOpen}

        onCancel={() =>
          setModalOpen(false)
        }

        footer={null}
      >

        <Select

          value={category}

          onChange={setCategory}

          style={{
            width: "100%",
            marginBottom: 15,
          }}
        >

          <Select.Option value="salary">
            Salary
          </Select.Option>

          <Select.Option value="rent">
            Rent
          </Select.Option>

          <Select.Option value="electricity">
            Electricity
          </Select.Option>

          <Select.Option value="internet">
            Internet
          </Select.Option>

          <Select.Option value="marketing">
            Marketing
          </Select.Option>

          <Select.Option value="transport">
            Transport
          </Select.Option>

          <Select.Option value="other">
            Other
          </Select.Option>

        </Select>

        <Input

          type="number"

          placeholder="Amount"

          value={amount}

          onChange={(e) =>
            setAmount(
              e.target.value
            )
          }

          style={{
            marginBottom: 15,
          }}
        />

        <DatePicker

          value={expenseDate}

          onChange={setExpenseDate}

          style={{
            width: "100%",
            marginBottom: 15,
          }}
        />

        <Input.TextArea

          rows={3}

          placeholder="Note"

          value={note}

          onChange={(e) =>
            setNote(
              e.target.value
            )
          }

          style={{
            marginBottom: 15,
          }}
        />

        <Button

          type="primary"

          block

          onClick={addExpense}
        >

          Save Expense

        </Button>

      </Modal>

    </MainLayout>
  );
}