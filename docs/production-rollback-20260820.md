# Production rollback trigger

This operational marker records the emergency restoration of the public homepage to the signed Applications-lockdown baseline `6a55200b6f528689f9b907a0e3da34db74f74093` after an overbroad root-page deletion. It intentionally changes no runtime behavior. Its purpose is to create a fresh signed `main` commit so the canonical Vercel production project redeploys the restored site while retaining the `/apps` lockdown.
