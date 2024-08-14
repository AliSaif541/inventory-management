"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../../../components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconMessage,
  IconUser,
  IconUserBolt,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";


export function SidebarDemo() {
  const {data: session} = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/api/auth/signin?callbackUrl=/Pantry");
    },
  });
  const links = [
    {
      label: "Pantry Dashboard",
      href: "/Pantry",
      icon: (
        <IconBrandTabler className="text-white dark:text-white h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Chatbot",
      href: "/Chatbot",
      icon: (
        <IconMessage className="text-white dark:text-white h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: session ? "Logout" : "Login",
      href: session ? "/api/auth/signout?callbackUrl=/" : "/api/auth/signin",
      icon: (
        <IconArrowLeft className="text-white dark:text-white h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  return (
    <Sidebar open={open} setOpen={setOpen} animate={false} >
    <SidebarBody className="justify-between gap-10 bg-[black] dark:bg-[black] text-white dark:text-white">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <>
            <Logo />
        </>
        <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
            <SidebarLink key={idx} link={link} />
            ))}
        </div>
        </div>
        <div>
        <SidebarLink
            link={{
            label: session?.user?.name,
            href: "#",
            icon: (
                <IconUser
                className="h-7 w-7 flex-shrink-0 rounded-full"
                width={50}
                height={50}
                />
            ),
            }}
        />
        </div>
    </SidebarBody>
    </Sidebar>
  );
}

export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-white py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-white dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-white dark:text-white whitespace-pre"
      >
        Pantry Management System
      </motion.span>
    </Link>
  );
};