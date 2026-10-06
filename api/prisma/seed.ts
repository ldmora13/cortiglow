import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminEmail = 'admin@cortiglow.com';
  const adminPassword = 'adminpassword123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.profile.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password_hash: passwordHash,
      full_name: 'Administrador Principal',
      role: 'admin',
    },
  });

  console.log('✅ Admin user created:');
  console.log(`Email: ${admin.email}`);
  console.log(`Password: ${adminPassword}`);
  console.log('Remember to change this password after your first login!');

  console.log('Seeding categories...');

  // Cleanup removed categories from previous drafts
  const toDeleteSlugs = [
    'persianas-madera', 'lamparas-candelabros', 'ilumina-cuadros', 'balizas-pared',
    'persianas-celulares', 'persianas-venecianas', 'peliculas-solares',
    // also remove old ones from first draft if they changed
    'lamparas-pie', 'iluminacion-pared'
  ];
  for (const s of toDeleteSlugs) {
    try { await prisma.category.delete({ where: { slug: s } }); } catch (e) {}
  }

  // 1. Nivel 1: Iluminación
  const iluminacion = await prisma.category.upsert({
    where: { slug: 'iluminacion' },
    update: { parent_id: null },
    create: { name: 'Iluminación', slug: 'iluminacion', image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800' },
  });

  // Nivel 2: Iluminación
  const ilumTecho = await prisma.category.upsert({ where: { slug: 'iluminacion-techo' }, update: { parent_id: iluminacion.id, image_url: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=800' }, create: { name: 'Iluminación de Techo', slug: 'iluminacion-techo', parent_id: iluminacion.id, image_url: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=800' } });
  const ilumPared = await prisma.category.upsert({ where: { slug: 'iluminacion-pared-interior' }, update: { parent_id: iluminacion.id, image_url: 'https://images.unsplash.com/photo-1507652313651-74fb58b5151f?auto=format&fit=crop&q=80&w=800' }, create: { name: 'Iluminación de Pared Interior', slug: 'iluminacion-pared-interior', parent_id: iluminacion.id, image_url: 'https://images.unsplash.com/photo-1507652313651-74fb58b5151f?auto=format&fit=crop&q=80&w=800' } });
  const ilumMesaPie = await prisma.category.upsert({ where: { slug: 'iluminacion-mesa-pie' }, update: { parent_id: iluminacion.id, image_url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800' }, create: { name: 'Iluminación de Pie y Mesa', slug: 'iluminacion-mesa-pie', parent_id: iluminacion.id, image_url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800' } });
  const ilumExterior = await prisma.category.upsert({ where: { slug: 'iluminacion-exterior' }, update: { parent_id: iluminacion.id, image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800' }, create: { name: 'Iluminación Exterior y Arquitectónica', slug: 'iluminacion-exterior', parent_id: iluminacion.id, image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800' } });
  const ilumSmart = await prisma.category.upsert({ where: { slug: 'tecnologia-led-smart' }, update: { parent_id: iluminacion.id, image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800' }, create: { name: 'Tecnología LED, Smart y Complementos', slug: 'tecnologia-led-smart', parent_id: iluminacion.id, image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800' } });

  // Nivel 3: Techo
  const techoSub = [
    { name: 'Lámparas Colgantes', slug: 'lamparas-colgantes', image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800' },
    { name: 'Plafones y Semi-Plafones', slug: 'lamparas-techo', image_url: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=800' },
    { name: 'Downlights y Empotrables (Balas)', slug: 'downlights-balas', image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800' },
    { name: 'Rieles y Focos Dirigibles', slug: 'rieles-focos', image_url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=800' },
    { name: 'Paneles LED', slug: 'paneles-led', image_url: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=800' },
  ];
  for (const sub of techoSub) { await prisma.category.upsert({ where: { slug: sub.slug }, update: { parent_id: ilumTecho.id, image_url: sub.image_url }, create: { ...sub, parent_id: ilumTecho.id } }); }

  // Nivel 3: Pared
  const paredSub = [
    { name: 'Apliques Clásicos y Modernos', slug: 'apliques-pared', image_url: 'https://images.unsplash.com/photo-1507652313651-74fb58b5151f?auto=format&fit=crop&q=80&w=800' },
  ];
  for (const sub of paredSub) { await prisma.category.upsert({ where: { slug: sub.slug }, update: { parent_id: ilumPared.id, image_url: sub.image_url }, create: { ...sub, parent_id: ilumPared.id } }); }

  // Nivel 3: Mesa y Pie
  const mesaPieSub = [
    { name: 'Lámparas de Pie Decorativas', slug: 'lamparas-pie-decorativas', image_url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800' },
    { name: 'Lámparas de Mesa y Noche', slug: 'lamparas-mesa', image_url: 'https://images.unsplash.com/photo-1515974256630-babc8576d662?auto=format&fit=crop&q=80&w=800' },
    { name: 'Lámparas de Escritorio y Trabajo', slug: 'lamparas-escritorio', image_url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=800' },
  ];
  for (const sub of mesaPieSub) { await prisma.category.upsert({ where: { slug: sub.slug }, update: { parent_id: ilumMesaPie.id, image_url: sub.image_url }, create: { ...sub, parent_id: ilumMesaPie.id } }); }

  // Nivel 3: Exterior
  const exteriorSub = [
    { name: 'Faroles y Apliques de Exterior', slug: 'faroles-apliques-exterior', image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800' },
    { name: 'Estacas y Reflectores de Jardín', slug: 'estacas-reflectores', image_url: 'https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&q=80&w=800' },
    { name: 'Iluminación Solar', slug: 'iluminacion-solar', image_url: 'https://images.unsplash.com/photo-1520699049698-acd2fce18736?auto=format&fit=crop&q=80&w=800' },
    { name: 'Iluminación Sumergible (Piscinas y Fuentes)', slug: 'iluminacion-sumergible', image_url: 'https://images.unsplash.com/photo-1572331165267-854da2b10ccc?auto=format&fit=crop&q=80&w=800' },
  ];
  for (const sub of exteriorSub) { await prisma.category.upsert({ where: { slug: sub.slug }, update: { parent_id: ilumExterior.id, image_url: sub.image_url }, create: { ...sub, parent_id: ilumExterior.id } }); }

  // Nivel 3: Smart
  const smartSub = [
    { name: 'Tiras LED y Neón Flex', slug: 'tiras-led', image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800' },
    { name: 'Bombillos Decorativos y Vintage', slug: 'bombillos-vintage', image_url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800' },
    { name: 'Sistemas Inteligentes y Domótica (Alexa/Google)', slug: 'bombillos-smart', image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800' },
  ];
  for (const sub of smartSub) { await prisma.category.upsert({ where: { slug: sub.slug }, update: { parent_id: ilumSmart.id, image_url: sub.image_url }, create: { ...sub, parent_id: ilumSmart.id } }); }

  // 2. Nivel 1: Cortinas
  const cortinas = await prisma.category.upsert({
    where: { slug: 'cortinas' },
    update: { parent_id: null },
    create: { name: 'Cortinas y Persianas', slug: 'cortinas', image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800' },
  });

  // Nivel 2: Cortinas
  const cortinasMod = await prisma.category.upsert({ where: { slug: 'persianas-vanguardia' }, update: { parent_id: cortinas.id, image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800' }, create: { name: 'Persianas Modernas', slug: 'persianas-vanguardia', parent_id: cortinas.id, image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800' } });
  const cortinasClas = await prisma.category.upsert({ where: { slug: 'cortinas-clasicas' }, update: { parent_id: cortinas.id, image_url: 'https://images.unsplash.com/photo-1522771731478-44fb896cbda5?auto=format&fit=crop&q=80&w=800' }, create: { name: 'Cortinas de Tela y Clásicas', slug: 'cortinas-clasicas', parent_id: cortinas.id, image_url: 'https://images.unsplash.com/photo-1522771731478-44fb896cbda5?auto=format&fit=crop&q=80&w=800' } });
  const cortinasVert = await prisma.category.upsert({ where: { slug: 'persianas-verticales-cat' }, update: { parent_id: cortinas.id, image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800' }, create: { name: 'Persianas Verticales', slug: 'persianas-verticales-cat', parent_id: cortinas.id, image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800' } });
  const cortinasEsp = await prisma.category.upsert({ where: { slug: 'sistemas-especializados' }, update: { parent_id: cortinas.id, image_url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=800' }, create: { name: 'Sistemas Especializados y Exteriores', slug: 'sistemas-especializados', parent_id: cortinas.id, image_url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=800' } });

  // Nivel 3: Modernas
  const modSub = [
    { name: 'Enrollables / Roller (Screen y Translúcidas)', slug: 'persianas-roller', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800' },
    { name: 'Sheer Elegance (Zebra / Doble Tela)', slug: 'sheer-elegance', image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800' },
    { name: 'Paneles Japoneses', slug: 'paneles-japoneses', image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800' },
  ];
  for (const sub of modSub) { await prisma.category.upsert({ where: { slug: sub.slug }, update: { parent_id: cortinasMod.id, image_url: sub.image_url }, create: { ...sub, parent_id: cortinasMod.id } }); }

  // Nivel 3: Clasicas
  const clasSub = [
    { name: 'Cortinas Tradicionales (Onda Serena y Pliegues)', slug: 'cortinas-tradicionales', image_url: 'https://images.unsplash.com/photo-1522771731478-44fb896cbda5?auto=format&fit=crop&q=80&w=800' },
    { name: 'Cortinas Blackout de Tela', slug: 'cortinas-blackout', image_url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800' },
    { name: 'Cortinas Romanas', slug: 'cortinas-romanas', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800' },
  ];
  for (const sub of clasSub) { await prisma.category.upsert({ where: { slug: sub.slug }, update: { parent_id: cortinasClas.id, image_url: sub.image_url }, create: { ...sub, parent_id: cortinasClas.id } }); }

  // Nivel 3: Verticales
  const vertSub = [
    { name: 'Persianas Verticales en Tela o PVC', slug: 'persianas-verticales', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800' },
  ];
  for (const sub of vertSub) { await prisma.category.upsert({ where: { slug: sub.slug }, update: { parent_id: cortinasVert.id, image_url: sub.image_url }, create: { ...sub, parent_id: cortinasVert.id } }); }

  // Nivel 3: Especiales
  const espSub = [
    { name: 'Cortinas y Persianas Motorizadas', slug: 'sistemas-motorizados', image_url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&q=80&w=800' },
    { name: 'Toldos Proyectantes y Verticales', slug: 'toldos-exteriores', image_url: 'https://images.unsplash.com/photo-1599696848652-f0ff23bc911f?auto=format&fit=crop&q=80&w=800' },
    { name: 'Pérgolas y Cubiertas Retráctiles', slug: 'pergolas-cubiertas', image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800' },
  ];
  for (const sub of espSub) { await prisma.category.upsert({ where: { slug: sub.slug }, update: { parent_id: cortinasEsp.id, image_url: sub.image_url }, create: { ...sub, parent_id: cortinasEsp.id } }); }

  console.log('✅ Categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
