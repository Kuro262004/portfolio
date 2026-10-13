import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate } from "react-router-dom";
import { LogOut, Plus, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { projectSchema } from "../lib/schemas";
import { useStore } from "../store/useStore";

function NewProjectForm() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(projectSchema), defaultValues: { category: "developer", featured: false } });

  const create = useMutation({
    mutationFn: (v) => api.createProject({ ...v, tags: v.tags.split(",").map((t) => t.trim()).filter(Boolean) }),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const field = (name, label, props = {}) => (
    <div className={props.wide ? "sm:col-span-2" : ""}>
      <label htmlFor={name} className="label">{label}</label>
      {props.textarea ? (
        <textarea id={name} rows={4} className="input" {...register(name)} />
      ) : (
        <input id={name} className="input" {...register(name)} placeholder={props.placeholder} />
      )}
      {errors[name] && <p className="field-error">{errors[name].message}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit((v) => create.mutate(v))} className="card grid gap-4 p-6 sm:grid-cols-2" noValidate>
      <h2 className="text-xl font-semibold sm:col-span-2">Add a project</h2>
      {field("title", "Title")}
      <div>
        <label htmlFor="category" className="label">Category</label>
        <select id="category" className="input" {...register("category")}>
          <option value="ai">AI</option>
          <option value="developer">Developer</option>
          <option value="designer">Designer</option>
          <option value="professional">Professional</option>
        </select>
      </div>
      {field("summary", "One-line summary", { wide: true })}
      {field("description", "Description", { wide: true, textarea: true })}
      {field("tags", "Tags (comma separated)", { placeholder: "React, FastAPI" })}
      {field("image_url", "Image URL", { placeholder: "https://…" })}
      {field("live_url", "Live URL", { placeholder: "https://…" })}
      {field("repo_url", "Repo URL", { placeholder: "https://…" })}
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" {...register("featured")} /> Featured
      </label>
      <div className="sm:col-span-2">
        <button className="btn-primary" disabled={create.isPending}>
          <Plus size={16} aria-hidden /> {create.isPending ? "Saving…" : "Publish project"}
        </button>
        {create.isError && <span className="ml-3 text-sm text-rose-400">{create.error.message}</span>}
        {create.isSuccess && <span className="ml-3 text-sm text-emerald-400">Published — visitors see it live.</span>}
      </div>
    </form>
  );
}

export default function Admin() {
  const token = useStore((s) => s.token);
  const logout = useStore((s) => s.logout);
  const queryClient = useQueryClient();

  const projects = useQuery({ queryKey: ["projects", "all"], queryFn: () => api.projects("all"), enabled: !!token });
  const messages = useQuery({ queryKey: ["messages"], queryFn: api.messages, enabled: !!token });
  const remove = useMutation({
    mutationFn: api.deleteProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  if (!token) return <Navigate to="/login" replace />;

  return (
    <main className="container-page space-y-10 py-24">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin</h1>
        <div className="flex gap-2">
          <Link to="/" className="btn-ghost">View site</Link>
          <button onClick={logout} className="btn-ghost">
            <LogOut size={16} aria-hidden /> Log out
          </button>
        </div>
      </div>

      <NewProjectForm />

      <section>
        <h2 className="mb-4 text-xl font-semibold">Projects</h2>
        <ul className="space-y-2">
          {projects.data?.map((p) => (
            <li key={p.id} className="card flex items-center justify-between gap-4 px-4 py-3">
              <span>
                <span className="font-medium text-white">{p.title}</span>
                <span className="ml-2 text-xs capitalize text-slate-400">{p.category}</span>
              </span>
              <button
                onClick={() => remove.mutate(p.id)}
                className="rounded-lg p-2 text-rose-400 hover:bg-rose-400/10"
                aria-label={`Delete ${p.title}`}
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Messages</h2>
        {messages.data?.length === 0 && <p className="text-slate-400">No messages yet.</p>}
        <ul className="space-y-3">
          {messages.data?.map((m) => (
            <li key={m.id} className="card p-4">
              <p className="text-sm">
                <span className="font-medium text-white">{m.name}</span> ·{" "}
                <a className="text-accent-alt" href={`mailto:${m.email}`}>{m.email}</a> ·{" "}
                <span className="text-slate-500">{new Date(m.created_at).toLocaleString()}</span>
              </p>
              <p className="mt-2 whitespace-pre-line">{m.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
