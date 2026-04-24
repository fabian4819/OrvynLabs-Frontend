"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectsList } from "./ProjectsList";
import { UsersList } from "./UsersList";
import { SystemHealth } from "./SystemHealth";
import { EventsLog } from "./EventsLog";

export function AdminTabs() {
  const [activeTab, setActiveTab] = useState("projects");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 glass-morphism">
        <TabsTrigger value="projects">Projects</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="health">System Health</TabsTrigger>
        <TabsTrigger value="events">Events Log</TabsTrigger>
      </TabsList>

      <TabsContent value="projects" className="mt-6">
        <ProjectsList />
      </TabsContent>

      <TabsContent value="users" className="mt-6">
        <UsersList />
      </TabsContent>

      <TabsContent value="health" className="mt-6">
        <SystemHealth />
      </TabsContent>

      <TabsContent value="events" className="mt-6">
        <EventsLog />
      </TabsContent>
    </Tabs>
  );
}
