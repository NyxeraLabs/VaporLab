export default function UserProfileSettings() {
  return (
    <section className="surface-card p-4">
      <h2 className="heading-font text-lg">User Profile Settings</h2>
      <div className="mt-3 grid gap-2">
        <input className="field" defaultValue="alex@workspace.local" />
        <input className="field" defaultValue="Alex Morgan" />
        <input className="field" defaultValue="Product Security Lead" />
        <button className="btn btn-primary w-fit">Update Profile</button>
      </div>
    </section>
  );
}
