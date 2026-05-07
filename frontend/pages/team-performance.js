import { useEffect, useState } from "react";
import { Card, Row, Col, Progress } from "antd";
import API from "../services/api";
import MainLayout from "../components/Layout";

export default function TeamPerformance() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("/leads/team-performance/")
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <MainLayout>
      <h2>Team Performance</h2>

      <Row gutter={[16, 16]}>
        {data.map((item, i) => (
          <Col xs={24} md={8} key={i}>
            <Card>
              <h3>{item.name}</h3>
              <p>Total: {item.total}</p>
              <p>Closed: {item.closed}</p>

              <Progress percent={item.conversion} />
            </Card>
          </Col>
        ))}
      </Row>
    </MainLayout>
  );
}