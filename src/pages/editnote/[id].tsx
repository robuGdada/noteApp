/* eslint-disable @typescript-eslint/no-floating-promises */
import { useRouter } from "next/router";
import { useState, useEffect, type ChangeEvent } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "../../utils/api";

interface FormData {
  title: string;
  description: string;
  id: string;
}

const EditNote: NextPage = () => {
  const utils = api.useContext();
  const router = useRouter();
  const [data, setData] = useState<FormData>({
    title: "",
    description: "",
    id: "",
  });
  const notesId = router.query.id as string;

  // Query for the note data and set the initial form data
  const { data: messageDetail } = api.mynotes?.detailNote.useQuery(
    {
      id: notesId,
    },
    {
      // Use stale data while the query is loading or refetching to avoid flashing
      staleTime: Infinity,
    }
  );

  useEffect(() => {
    setData({
      title: messageDetail?.title || "",
      description: messageDetail?.description || "",
      id: messageDetail?.id || "",
    });
  }, [messageDetail]);

  // Mutation to update the note
  const updateNote = api.mynotes.updateNote.useMutation({
    // Use optimistic updates to update the allNotes query cache
    onMutate: (updatedNote) => {
      utils.mynotes.allNotes.cancel();
      const optimisticUpdate = utils.mynotes.allNotes.getData();

      if (optimisticUpdate) {
        // Find the index of the note being updated and replace it with the updated note
        const index = optimisticUpdate.findIndex(
          (note) => note.id === updatedNote.id
        );
        optimisticUpdate.splice(index, 1, updatedNote);

        utils.mynotes.allNotes.setData([...optimisticUpdate]);
      }
    },
    // Invalidate the allNotes and detailNote queries to refetch the data after the mutation
    onSettled: () => {
      utils.mynotes.allNotes.invalidate();
      utils.mynotes.detailNote.invalidate();
    },
  });

  const handleDescriptionChange = (
    event: ChangeEvent<HTMLTextAreaElement>
  ) => {
    setData((prevData) => ({
      ...prevData,
      description: event.target.value,
    }));
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setData((prevData) => ({
      ...prevData,
      title: event.target.value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateNote.mutate({
      title: data.title,
      description: data.description,
      id: data.id,
    });
    // Clear the form data after submission
    setData({
      title: "",
      description: "",
      id: "",
    });
  };

  return (
    <>
      <Head>
        <title>Edit Note</title>
        <meta name="description" content="Edit your note" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mx-auto flex min-h-screen flex-col justify-center py-10 md:container">
        <Link
          href="/"
          className="indigo-700 inline-block py-4 text-base font-semibold leading-7 text-green-700"
        >
          Go back
        </Link>
        <h1 className="mb-6 text-left text-3xl font-bold tracking-tight text-gray-900">
          Edit your note
        </h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            required
            value={data.title}
            placeholder="Your title"
            onChange={handleTitleChange}
            className="border-1 mb-2 block w-full rounded-sm border-green-800 bg-neutral-100 px-4 py-2 focus:outline-none"
          />
          <textarea
            required
            value={data.description}
            placeholder="Your description"
            onChange={handleDescriptionChange}
            className="border-1 mb-2 block w-full rounded-sm border-green-800 bg-neutral-100 px-4 py-2 focus:outline-none"
          />
          <button
            type="submit"
            className="block w-full rounded-lg bg-green-600 px-4 py-1.5 text-base font-semibold leading-7 text-white shadow-sm ring-1 ring-green-600 hover:bg-green-700 hover:ring-green-700"
          >
            Add a note
          </button>
        </form>
      </main>
    </>
  );
};

export default EditNote;