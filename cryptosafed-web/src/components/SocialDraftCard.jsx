export default function SocialDraftCard({ socialDraft }) {
  if (!socialDraft) return null;

  const { seo_title, meta_description, post_text, disclaimer } = socialDraft;

  return (
    <section className="bg-surface border border-line rounded-2xl p-6 shadow-sm shadow-navy/5 space-y-4">
      <h2 className="text-base font-semibold text-navy">
        Social &amp; blog draft
      </h2>

      <div>
        <p className="text-xs font-medium text-navy/40 mb-1">SEO title</p>
        <p className="text-sm text-navy">{seo_title}</p>
      </div>
      <div>
        <p className="text-xs font-medium text-navy/40 mb-1">
          Meta description
        </p>
        <p className="text-sm text-navy/80">{meta_description}</p>
      </div>
      <div>
        <p className="text-xs font-medium text-navy/40 mb-1">Post text</p>
        <p className="text-sm text-navy/80 whitespace-pre-line">{post_text}</p>
      </div>
      <div className="border-t border-line pt-4">
        <p className="text-xs text-navy/60">{disclaimer}</p>
      </div>
    </section>
  );
}
