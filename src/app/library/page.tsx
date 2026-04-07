import { getStudyItemsAction } from "@/app/actions";
import { LibraryContent } from "@/components/LibraryContent";

export default async function LibraryPage() {
  const result = await getStudyItemsAction();
  const items = result.ok ? result.items : [];

  return <LibraryContent initialItems={items} isSignedIn={result.ok} />;
}
