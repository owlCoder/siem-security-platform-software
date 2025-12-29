import { Route, Routes } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { IAuthAPI } from "./api/auth/IAuthAPI";
import { AuthAPI } from "./api/auth/AuthAPI";
import { UserAPI } from "./api/users/UserAPI";
import { IUserAPI } from "./api/users/IUserAPI";
import MainLayout from "./pages/MainLayout";
import { IAlertAPI } from "./api/alerts/IAlertAPI";
import { AlertAPI } from "./api/alerts/AlertAPI";
import { IParserAPI } from "./api/parser/IParserAPI";
import { ParserAPI } from "./api/parser/ParserAPI";
import { IQueryAPI } from "./api/query/IQueryAPI";
import { QueryAPI } from "./api/query/QueryAPI";
import { IStorageAPI } from "./api/storage/IStorageAPI";
import { StorageAPI } from "./api/storage/StorageAPI";

const auth_api: IAuthAPI = new AuthAPI();
const user_api: IUserAPI = new UserAPI();
const alerts_api:IAlertAPI=new AlertAPI();
const parser_api:IParserAPI=new ParserAPI();
const query_api:IQueryAPI=new QueryAPI();
const storage_api:IStorageAPI=new StorageAPI();

function App() {
  return (
    <>
      <Routes>
        {/* <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="admin,seller">
              <DashboardPage userAPI={user_api} anotherAPI={API} />
            </ProtectedRoute>
          }
        /> */}
        <Route path="/" element={<AuthPage authAPI={auth_api} />} />

        {/* Temporary unprotected route — should require authentication */}
        <Route path="/mainLayout" element={<MainLayout alertsAPI={alerts_api}
                  parserAPI={parser_api} queryAPI={query_api} storageAPI={storage_api} />} />
      </Routes>
    </>
  );
}

export default App;
