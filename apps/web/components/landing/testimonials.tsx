import feedback from "@/content/testimonials.json";
import styles from "./testimonials.module.css";

type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  initials: string;
  sample: boolean;
  sourceUrl?: string;
};

const testimonials = feedback.testimonials as Testimonial[];

export function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="testimonials-heading">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Builder perspectives</p>
          <h2 id="testimonials-heading">{feedback.title}</h2>
          <p className={styles.description}>{feedback.description}</p>
        </div>

        <div className={styles.grid}>
          {testimonials.map((item, index) => {
            const card = (
              <figure className={styles.card}>
                <figcaption className={styles.author}>
                  <span className={`${styles.avatar} ${styles[`avatar${index % 6}`]}`} aria-hidden="true">
                    {item.initials}
                  </span>
                  <span className={styles.identity}>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.role}>{item.role}</span>
                  </span>
                  {item.sample && <span className={styles.sample}>Sample</span>}
                </figcaption>
                <blockquote className={styles.quote}>{item.quote}</blockquote>
              </figure>
            );

            return (
              <div className={styles.item} key={item.id}>
                {item.sourceUrl?.startsWith("https://") ? (
                  <a className={styles.link} href={item.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`Read ${item.name}'s original feedback`}>
                    {card}
                  </a>
                ) : card}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
