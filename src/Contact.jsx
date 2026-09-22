import MenuTrack from "./MenuTrack";
import ContactNaslov from "./ContactNaslov";
import ContactInfo from "./ContactInfo";
import ContactMap from "./ContactMap";
import ContactForm from "./ContactForm";

function Contact() {
  return (
    <div
      className="
        relative
        min-h-screen
        w-full
        bg-[url('/contact-background/contact-background-image.png')]
        bg-cover
        bg-center
        bg-fixed
      "
    >
      {/* MENU TRACK */}
      <div className="relative h-[80px]">
        <MenuTrack />
      </div>

      {/* KONTAKT NASLOV */}
      <div className="flex flex-col gap-12">
        <ContactNaslov />
        <ContactInfo />
        <ContactMap />
        <ContactForm />
      </div>
    </div>
  );
}

export default Contact;
