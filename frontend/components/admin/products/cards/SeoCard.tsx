"use client";

import {
  Search,
  Globe,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface SeoInfo {
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  [key: string]: unknown;
}

interface Props {
  seo?: SeoInfo;
}

export default function SeoCard({
  seo = {}
}: Props) {
  const {
    metaTitle,
    metaDescription,
    slug
  } = seo || {};

  const isComplete = Boolean(metaTitle && slug);

  return (
    <div
      className="
        border
        border-gray-200
        rounded-2xl
        p-6
        space-y-6
        bg-white
        shadow-sm
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
        "
      >
        <div
          className="
            flex
            items-center
            gap-2.5
          "
        >
          <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
            <Search size={20} />
          </div>
          <div>
            <h3
              className="
                font-semibold
                text-lg
                text-gray-900
              "
            >
              Search Engine Optimization (SEO)
            </h3>
            <p className="text-xs text-gray-500">Manage search engine visibility and snippets.</p>
          </div>
        </div>

        <div
          className={`
            px-3
            py-1
            rounded-lg
            text-xs
            font-semibold
            flex
            items-center
            gap-1.5
            ${
              isComplete
                ? "bg-green-50 text-green-700 border border-green-100"
                : "bg-amber-50 text-amber-700 border border-amber-100"
            }
          `}
        >
          {isComplete ? (
            <>
              <CheckCircle2 size={14} />
              Optimized
            </>
          ) : (
            <>
              <AlertCircle size={14} />
              Incomplete
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="
            border
            border-gray-200
            rounded-xl
            p-4
            bg-gray-50/50
            space-y-1.5
          "
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <FileText size={14} />
            Meta Title
          </div>
          <p className="font-bold text-gray-900 text-sm line-clamp-1">
            {
              metaTitle ||
              <span className="text-gray-400 font-normal italic">Not added</span>
            }
          </p>
        </div>

        <div
          className="
            border
            border-gray-200
            rounded-xl
            p-4
            bg-gray-50/50
            space-y-1.5
          "
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <Globe size={14} />
            URL Slug
          </div>
          <p className="font-mono text-xs font-bold text-gray-900 line-clamp-1 mt-1">
            {
              slug ? (
                <span className="text-blue-600">availnns.com/product/{slug}</span>
              ) : (
                <span className="text-gray-400 font-normal italic font-sans text-sm">Not added</span>
              )
            }
          </p>
        </div>
      </div>

      <div
        className="
          border
          border-gray-200
          rounded-xl
          p-4
          bg-white
          space-y-1.5
          shadow-xs
        "
      >
        <p className="text-xs font-medium text-gray-500">Meta Description Preview</p>
        <p
          className="
            text-sm
            text-gray-700
            line-clamp-2
            leading-relaxed
          "
        >
          {
            metaDescription ||
            <span className="text-gray-400 italic">No meta description provided. Search engines will automatically generate a snippet from your product description.</span>
          }
        </p>
      </div>
    </div>
  );
}
