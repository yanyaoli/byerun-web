export default function useLoginState() {
  const token = localStorage.getItem("token");
  const userDataItem = localStorage.getItem("userData");
  const userData = userDataItem ? JSON.parse(userDataItem) : null;

  if (!token || !userData) {
    return false;
  } else {
    return true;
  }
}
