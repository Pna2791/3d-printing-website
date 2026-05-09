import { Globe, Mail, Map, MapPin, Phone, Play, Music2 } from "lucide-react";

import type { AppLocale } from "@/lib/i18n-dictionary";
import { getDictionary } from "@/lib/i18n-dictionary";
import { OFFLINE_ORDER_CONTACT } from "@/lib/config";
import {
  WORKSHOP_FULL_ADDRESS_VI,
  WORKSHOP_MAPS_SHARE_URL,
} from "@/lib/workshop-location";

type ContactSectionProps = {
  locale: AppLocale;
  email?: string;
};

const SOCIAL_LINKS = [
  { label: "Fanpage", href: OFFLINE_ORDER_CONTACT.fanpageUrl, icon: Globe },
  { label: "YouTube", href: "https://youtube.com", icon: Play },
  { label: "TikTok", href: "https://tiktok.com", icon: Music2 },
];

export function ContactSection({ locale, email }: ContactSectionProps) {
  const c = getDictionary(locale).home.contact;

  return (
    <section
      aria-labelledby="contact-heading"
      className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2
        id="contact-heading"
        className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
      >
        {c.title}
      </h2>

      <div className="mt-6 grid gap-4 text-sm text-zinc-700 dark:text-zinc-200 sm:grid-cols-2">
        <a
          href={WORKSHOP_MAPS_SHARE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-start gap-2 rounded-xl underline decoration-zinc-300 underline-offset-4 transition hover:text-emerald-700 hover:decoration-emerald-600 dark:decoration-zinc-600 dark:hover:text-emerald-400 dark:hover:decoration-emerald-500/70"
        >
          <span className="inline-flex shrink-0 items-center gap-1 pt-0.5">
            <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
            <Map className="h-4 w-4 text-emerald-600/85 dark:text-emerald-400/85" aria-hidden />
          </span>
          <span className="min-w-0 leading-relaxed">{WORKSHOP_FULL_ADDRESS_VI}</span>
        </a>
        <a
          href="tel:0848939059"
          className="inline-flex items-center gap-2 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:decoration-zinc-600"
        >
          <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          {c.phoneDisplay}
        </a>
        {email ? (
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500 dark:decoration-zinc-600"
          >
            <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            {email}
          </a>
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {SOCIAL_LINKS.map((social) => {
          const Icon = social.icon;
          return (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              <Icon className="h-4 w-4" />
              {social.label}
            </a>
          );
        })}
      </div>
    </section>
  );
}
