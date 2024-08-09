import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

const Chatbot = async () => {
    const session = await getServerSession(options);

    if (!session) {
        redirect("/api/auth/signin?callbackUrl=/Chatbot")
    }

    return (
        <div>
            <h1>Chatbot</h1>
            <p>{session?.user?.email}</p>
            <p>{session?.user?.role}</p>
        </div>
    )
}

export default Chatbot;