'use client';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Linkedin, Github } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-2">Contact Me</h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-primary"></div>
            <span className="text-primary font-medium tracking-wider uppercase text-sm">Get In Touch</span>
            <div className="h-[1px] w-12 bg-primary"></div>
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-12">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full md:w-1/2 space-y-8">
            <h3 className="text-2xl font-bold text-white">Let's Connect</h3>
            <p className="text-gray-400">Feel free to reach out for collaborations, opportunities, or just to say hi.</p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-card flex items-center justify-center rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors border border-primary/20">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium">Phone</h4>
                  <p className="text-gray-400">03072173457</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-card flex items-center justify-center rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors border border-primary/20">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium">Email</h4>
                  <p className="text-gray-400">faisalabshar2002@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-card flex items-center justify-center rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors border border-primary/20">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium">Location</h4>
                  <p className="text-gray-400">Karachi, Pakistan</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-primary/20 flex gap-4">
              <a href="https://linkedin.com/in/faisal-abshar-0057b01b1" target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-card hover:bg-primary hover:text-white text-gray-400 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="https://github.com/MuhammadFaisal2002" target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-card hover:bg-primary hover:text-white text-gray-400 transition-colors">
                <Github size={20} />
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full md:w-1/2">
            <form className="bg-card p-8 rounded-xl border border-primary/20 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <input type="text" placeholder="Name" className="w-full bg-background border border-primary/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <input type="email" placeholder="Email" className="w-full bg-background border border-primary/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <div>
                <input type="text" placeholder="Subject" className="w-full bg-background border border-primary/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <textarea rows={5} placeholder="Message" className="w-full bg-background border border-primary/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"></textarea>
              </div>
              <button type="button" className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-4 rounded-lg transition-colors flex justify-center items-center gap-2">
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
