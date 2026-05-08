import ShoppingList from "@/components/ShoppingList";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
      <ShoppingList />
    </div>
  );
}
