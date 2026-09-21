import { AppRouter } from "./routes/AppRouter";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";

const App = () => {
  return (
    <AuthProvider>
      <WishlistProvider>
        <AppRouter />
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
