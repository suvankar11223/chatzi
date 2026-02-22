import { useState, useEffect } from "react";
import { apiFetch } from "../services/apiService";

export const useContacts = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/user/contacts");

      console.log("Contacts response:", res);

      if (res.success) {
        setContacts(res.data);
      } else {
        setError(res.msg);
      }
    } catch (err: any) {
      console.error("Contacts fetch failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return { contacts, loading, error, refetch: fetchContacts };
};
