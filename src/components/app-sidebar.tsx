"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  TerminalSquareIcon,
  BotIcon,
  BookOpenIcon,
  Settings2Icon,
  FrameIcon,
  PieChartIcon,
  MapIcon,
  BarChartIcon,
  DatabaseIcon,
  Sparkle,
} from "lucide-react";

// This is sample data.
const data = {
  user: {
    name: "Vinesh",
    email: "vinesh@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },

  teams: [
    {
      name: "DeepSights",
      logo: <GalleryVerticalEndIcon />,
      plan: "Enterprise",
    },
  ],

  navMain: [
    {
      title: "Sites",
      url: "/sites",
      icon: <TerminalSquareIcon />,
    },
    {
      title: "Charts",
      url: "/charts",
      icon: <BarChartIcon />,
    },
    {
      title: "Chat",
      url: "/chat",
      icon: <Sparkle />,
    },
    {
      title: "Inventory",
      url: "#",
      icon: <DatabaseIcon />, 
      items: [
        {
          title: "Gateways",
          url: "/inventory/gateways",
        },
        {
          title: "Loads",
          url: "/inventory/loads",
        },
        {
          title: "Meters",
          url: "/inventory/meters",
        },
      ],
    },
  ],

};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />

      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
