import { Layout } from "antd";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const { Content } = Layout;

export default function MainLayout({ children }) {

  return (
    <Layout style={{ minHeight: "100vh" }}>

      {/* 🔥 SIDEBAR */}
      <Sidebar />

      <Layout>

        {/* 🔥 TOPBAR (NEW CLEAN HEADER) */}
        <Topbar />

        {/* 🔥 CONTENT */}
        <Content
            style={{
              padding:
                typeof window !== "undefined" &&
                window.innerWidth < 768
                  ? 10
                  : 20,

              background: "#f5f5f5",

              minHeight: "100vh",

              marginLeft:
                typeof window !== "undefined" &&
                window.innerWidth < 768
                  ? 0
                  : 230,

              overflowX: "hidden",
            }}
        >
          {children}
        </Content>

      </Layout>
    </Layout>
  );
}