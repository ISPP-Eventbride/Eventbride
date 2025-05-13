INSERT IGNORE INTO users (id, username, role, email, first_name, last_name, telephone, dni, profile_picture, password, plan, payment_plan_date, expire_plan_date, receives_emails) VALUES 
-- clientes
(1, 'D4nielBH', 'CLIENT', 'danbenhid@alum.us.es', 'Daniel', 'Benito Hidalgo', '612834957', '12345678Z', 'https://i.pinimg.com/736x/cc/e6/e8/cce6e81540e6282c551f01937049614e.jpg', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', null, null, null, false),
(2, 'alice123', 'CLIENT', 'alice@example.com', 'Alice', 'Johnson', '678420139', '00000000T', 'https://randomuser.me/api/portraits/women/43.jpg', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', null, null, null, false),
(3, 'Natalii', 'CLIENT', 'natolmvil@alum.us.es', 'Natalia', 'Olmo Villegas', '699101385', '11111111H', 'https://media.licdn.com/dms/image/v2/D5603AQEG3z5ORRPXow/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1726919084266?e=2147483647&v=beta&t=atwQwaGmE3k9Zi-YdTCTkr5SzHngGKY44vfcAZdhaY4', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', null, null, null, false),
(4, 'PabloCC', 'CLIENT', 'pabcascom@alum.us.es', 'Pablo', 'Castellanos Compaña', '722349678', '22222222J', 'https://i.pinimg.com/736x/06/f0/79/06f07921405f71844818fa78bd8064f0.jpg', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', null, null, null, false),
(5, 'MariaCT', 'CLIENT', 'marcartal1@alum.us.es', 'María', 'Carrera Talaverón', '745210844', '33333333P', 'https://pbs.twimg.com/media/EyaRtQoWgAMd7iU.jpg', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', null, null, null, true),
(16, 'Fraan', 'CLIENT', 'fraavicar@alum.us.es.com', 'Fran', 'Avilés Carrera', '914782650', '44444444A', 'https://media.licdn.com/dms/image/v2/D4E03AQFk3oiu-3OLDQ/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1731263648526?e=2147483647&v=beta&t=iWb8NwRLUnxVmF34sGj0DReKSFEHm-99wXLlEH5ebPA', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', null, null, null, true),
-- proveedores
(6, 'ElCastilloDeMaxi', 'SUPPLIER', 'CastilloMaxi@example.com', 'Castillo', 'Maxi', '933204187', '55555555K', 'https://www.guiacatering.com/site/company/a7/1176/images/366309/el-castillo-de-maxi_ci3.jpg', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', "PREMIUM", '2025-03-20', '2030-04-20', false),
(7, 'JLMorilla', 'SUPPLIER', 'foto@example.com', 'Juan Luis', 'Morilla', '981723411', '66666666Q', 'https://www.juanluismorilla.com/wp-content/uploads/2020/06/JLM_logomarca_RGB.png', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', "PREMIUM", '2025-03-20', '2030-04-20', false),
(8, 'JMGomez', 'SUPPLIER', 'jmgosevilla@example.com', 'Jose Manuel', 'Gomez', '856390200', '77777777B', 'https://www.corteganaiberico.com/wp-content/uploads/2021/10/pata-negra-y-jamon-iberico-1.png', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', "PREMIUM", '2025-03-20', '2030-04-20', false),
(9, 'JMGonzalez', 'SUPPLIER', 'gonzalezcaraballojosemanuel@example.com', 'Jose Manuel', 'Gonzalez Caraballo', '924105863', '88888888Y', 'https://www.jamonibericomatas.com/wp-content/uploads/2022/01/Consejos-sobre-como-cortar-jamon-iberico-de-bellota.jpg', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', "BASIC", null, null, false),
(10, 'FelipeGN', 'SUPPLIER', 'felielectri@example.com', 'Felipe', 'G', '613204859', '99999999R', 'https://www.shutterstock.com/image-photo/woman-cutting-cheese-kitchen-slicing-600nw-2441834571.jpg', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', "BASIC", null, null, true),
(11, 'DLDecor', 'SUPPLIER', 'info@example.com', 'David', 'Lara', '695478123', '87654321X', 'https://www.davidlaradecor.es/wp-content/uploads/2018/01/logo-portada.png', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', "BASIC", null, null, false),
(12, 'MasterSound', 'SUPPLIER', 'danielvillarrealgallardo@example.com', 'Daniel', 'Villareal Gallardo', '721349587', '13579246T', 'https://thumbs.static-thomann.de/thumb/padthumb600x600/pics/bdb/_54/545096/17370601_800.jpg', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', "BASIC", null, null, false),
(13, 'ARCOS3CATERING', 'SUPPLIER', 'mariatrigueros16.maccga@example.com', 'Maria', 'Trigueros', '677902345', '24681357B', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvhC6mgSHclnNr2RPV1gDcZl7F0sC-ND4pcw&s', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', "BASIC", null, null, false),
(14, 'MongoMango', 'SUPPLIER', 'mongomango@example.com', 'Mongo', 'Mango', '932649056', '10293847J', 'https://vientosolar.org/wp-content/uploads/2016/03/bpp8409a-401x249.jpg', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', "BASIC", null, null, false),
(17, 'SurMusic', 'SUPPLIER', 'surmusicsevilla@example.com', 'Sur', 'Music', '678006287', '90817263S', 'https://surmusicsevilla.com/wp-content/uploads/2021/01/cropped-cropped-LOGO-BLANCO-1-RECORTADO.jpeg', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', "BASIC", null, null, true),
(18, 'PandoCatering&Hacienda', 'SUPPLIER', 'gruposaneloy@example.com', 'Pando', 'Catering', '746829103', '19283746V', 'https://cateringpando.com/wp-content/uploads/2024/03/logo-index-catering-pando.png', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', "PREMIUM", '2025-03-20', '2030-04-20', true),
-- para probar notificaciones
(19, 'Urgoneta', 'SUPPLIER', 'gonnavrem@alum.us.es', 'Urgon', 'Furgoneta', '934782651', '56473829C', 'https://carwow-es-wp-0.imgix.net/mercedes-benz_sprinter_panel_van_1.jpeg', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', "PREMIUM", '2025-03-20', '2030-04-20', true),
-- admin
(15, 'Admin', 'ADMIN', 'info@eventbride.fun', 'Admin', 'Soyadmin', '855203974', '47586931T', 'https://iili.io/3R8p4yu.png', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', null, null, null, false);

INSERT IGNORE INTO venues (id, postal_code, coordinates, address, max_guests, surface, name, available, city_available, service_price_guest, service_price_hour, picture, description, user_id, limited_by_price_per_guest, limited_by_price_per_hour, fixed_price, earliest_time, latest_time) VALUES 
(1, '41000', '37.42571305296568, -5.82959169111589', 'Cam. Rocío, 404', 110, 100.00, 'Castillo de Maxi' ,TRUE, 'Sevilla', null, null, 'https://www.guiacatering.com/site/company/a7/1176/images/366309/el-castillo-de-maxi_ci3.jpg', '¿Sabías que entre nuestros servicios se encuentra la posibilidad de disfrutar de un castillo hinchable? ¡Los más pequeños se lo pasarán en grande!', 6, FALSE, FALSE, 1500.00, '09:00:00', '23:59:00'),
(2, '41002', '37.411093725285504, -5.961539418106147', 'C/ Escarpia, 65', 200, 180.00, 'Mongo Mangos' ,TRUE, 'Sevilla', null, 400.00,'https://vientosolar.org/wp-content/uploads/2016/03/bpp8409a-401x249.jpg', 'Proporcionamos un lugar apegado a la naturaleza para que puedas disfrutar de un evento inolvidable.', 14, FALSE, TRUE, null, '09:00:00', '23:59:00'),
(3, '41016', '37.384586822413134, -5.924800681544798', 'Polígono el Pino, C/ Pino Alepo, 26', 250, 200.00, 'Local Sur Music' ,TRUE, 'Sevilla', null, 450.00,'https://iili.io/3Y5Vygt.jpg', 'SurMusic Sevilla es una empresa especializada en la producción de eventos integrales y cuenta con más de 10 años de experiencia en el sector. Durante este tiempo, hemos trabajado en colaboración con empresas privadas, ayuntamientos y organizaciones, para llevar a cabo una amplia variedad de eventos. ', 17, FALSE, TRUE, null, '09:00:00', '23:59:00'),
(4, '41110', '37.348800012123185, -6.13346199446344', 'Ctra. Prado de la Torre, S/N', 1750, 4000.00, 'Hacienda Pando' ,TRUE, 'Sevilla', null, null,'http://haciendapando.com/wp-content/uploads/2023/12/haciendas-en-sevilla-para-celebraciones-scaled.jpg', 'La Hacienda Pando lleva décadas albergando todo tipo de eventos, ya sea para empresas o de corte familiar con bodas, comuniones o bautizos. En esta cuidada hacienda de estilo andaluz, con bellos jardines y amplios salones, pueden albergarse hasta 900 comensales.', 18, FALSE, FALSE, 5000.00, '10:00:00', '20:00:00'),
(5, '41001', '37.39132080000252, -5.997529461937325', 'C. San Eloy, 47', 189, 350.00, 'Restaurante Pando 1', TRUE, 'Sevilla', 42.00, null,'https://cateringpando.com/wp-content/uploads/2024/03/restaurante_pando_sevilla.jpg', 'Sumérgete en el encanto de la tradición andaluza en nuestro restaurante, ubicado en el corazón vibrante de Sevilla.', 18, TRUE, FALSE, null, '08:00:00', '23:30:00'),
(6, '41001', '37.39132080000252, -5.997529461937325', 'C. San Eloy, 47', 189, 350.00, 'Restaurante Pando 2', TRUE, 'Sevilla', 46.00, null,'https://cateringpando.com/wp-content/uploads/2024/03/restaurante_pando_sevilla.jpg', 'Sumérgete en el encanto de la tradición andaluza en nuestro restaurante, ubicado en el corazón vibrante de Sevilla.', 18, TRUE, FALSE, null, '08:00:00', '23:30:00'),
(7, '41001', '37.39132080000252, -5.997529461937325', 'C. San Eloy, 47', 189, 350.00, 'Restaurante Pando 3', TRUE, 'Sevilla', 49.00, null,'https://cateringpando.com/wp-content/uploads/2024/03/restaurante_pando_sevilla.jpg', 'Sumérgete en el encanto de la tradición andaluza en nuestro restaurante, ubicado en el corazón vibrante de Sevilla.', 18, TRUE, FALSE, null, '08:00:00', '23:30:00');

INSERT IGNORE INTO other_services (id, other_service_type, extra_information, name, available, city_available, service_price_guest, service_price_hour, picture, description, user_id, limited_by_price_per_guest, limited_by_price_per_hour, fixed_price) VALUES
(1, 'ENTERTAINMENT', 'Servicio de fotografía',  'Fotografías J. L. Morilla.' ,FALSE, 'Sevilla', 15.00, null, 'https://www.juanluismorilla.com/wp-content/uploads/2020/06/JLM_logomarca_RGB.png', 'Soy Juan Luis, fotógrafo de bodas con más de 20 años de experiencia, y el encargado de daros un álbum de fotos con el que podáis revivir el día de vuestra boda, una y otra vez, con todo lujo de detalles.', 7, TRUE, FALSE, null),
(2, 'CATERING', 'Cortador de jamon',  'Cortador de jamón J. M. Gomez.' ,TRUE, 'Sevilla', null, 300.00, 'https://iili.io/3A1Dqc7.md.jpg', 'Eleva la experiencia gastronómica con cortes precisos y elegantes. Especializado en el arte del jamón, combina destreza, técnica y conocimiento del producto para resaltar su sabor y textura. Ideal para eventos, restaurantes o amantes del jamón que buscan un servicio de calidad y presentación impecable.', 8, FALSE, TRUE, null),
(3, 'CATERING', 'Cortador de jamon',  'Cortador de jamón J. M. Gonzalez.' ,TRUE, 'Sevilla', null, 400.00, 'https://www.jamonibericomatas.com/wp-content/uploads/2022/01/Consejos-sobre-como-cortar-jamon-iberico-de-bellota.jpg', 'Más que un oficio, un arte. Con habilidad y precisión, transforma cada pieza de jamón en finas lonchas que realzan su sabor y aroma. Un equilibrio perfecto entre técnica, tradición y pasión, ofreciendo una experiencia gastronómica única en eventos, celebraciones o catas especializadas.', 9, FALSE, TRUE, null),
(4, 'CATERING', 'Cortador de queso',  'Cortador de queso FelipeGN.' ,TRUE, 'Sevilla', null, 200.00, 'https://cdn.shopify.com/s/files/1/0399/9901/3016/files/CORTAR_EL_QUESO-2.png?v=1740041498', 'En un rincón, cortando queso… Con paciencia y precisión, el maestro cortador transforma cada pieza en porciones perfectas, resaltando su textura y sabor. Entre aromas intensos y tablas bien dispuestas, su oficio convierte cada corte.', 10, FALSE, TRUE, null),
(5, 'DECORATION', 'Decorador de eventos',  'Decorador de eventos DLDecor.' ,FALSE, 'Sevilla', null, null, 'https://www.davidlaradecor.es/wp-content/uploads/2018/01/logo-portada.png', 'Convierte tus eventos en experiencias inolvidables. Con un estilo único y creativo, el decorador de eventos transforma espacios en escenarios de ensueño, llenos de color, texturas y detalles que reflejan tu personalidad y estilo.', 11, FALSE, FALSE, 200.00),
(6, 'ENTERTAINMENT', 'Sonido para eventos',  'Master Sound.' ,TRUE, 'Sevilla', null, 200.00, 'https://thumbs.static-thomann.de/thumb/padthumb600x600/pics/bdb/_54/545096/17370601_800.jpg', 'Con nosotros no te perderás nada. En Master Sound, te escuchamos.', 12, FALSE, TRUE, null),
(7, 'CATERING', 'Catering para eventos',  'ARCOS 3 CATERING.' ,FALSE, 'Sevilla', 200.00, null, 'https://cdn0.bodas.net/vendor/16070/3_2/960/jpeg/whatsapp-image-2022-11-17-at-1-15-18-pm_1_16070-166868815185642.jpeg', 'Nos ponemos a tu servicio con nuestro equipo de profesionales preocupados por que todo salga perfecto en cualquier tipo de evento o celebración que realicen.', 13, TRUE, FALSE, null);

INSERT IGNORE INTO events (id, event_type, guests, event_date, payment_date, confirmed_guests, paid, user_id, name) VALUES
(1, 'WEDDING', 120, '2026-12-31', '2026-07-31', 115, TRUE, 1, "Boda de Daniel y Paula"),
(2, 'CHRISTENING', 50, '2026-12-31', '2026-07-31', 40, TRUE, 2, "Bautizo de Juan Carlos"),
(3, 'WEDDING', 200, '2026-12-31', '2026-07-31', 190, TRUE, 3, "Boda de Manolo y Lucía"),
(4, 'COMMUNION', 100, '2026-12-31', '2026-09-30', 90, TRUE, 4, "Comunión de Jesús"),
(6, 'WEDDING', 100, '2026-06-30', '2026-01-28', 90, TRUE, 1, "Boda de Antonio y María del Mar"),
(5, 'WEDDING', 100, '2026-12-31', '2026-07-31', 90, TRUE, 5, "Boda de Juan y Nerea"),
(7, 'CHRISTENING', 50, '2026-07-30', '2026-06-30', 40, TRUE, 3, "Bautizo de Paco"),
(8, 'COMMUNION', 30, '2026-08-30', '2026-05-30', 25, TRUE, 2, "Comunión de Pilar"),
(9, 'WEDDING', 200, '2026-09-30', '2026-04-30', 190, TRUE, 4, "Boda de Pepe y Sofía"),
(10, 'CHRISTENING', 100, '2026-10-30', '2026-09-30', 90, TRUE, 5, "Bautizo de María");


INSERT IGNORE INTO invitations (id, first_name, last_name, number_of_guests, max_guests, telephone, email, invitation_type, event_id) VALUES
(1, 'Antonio', 'Martinez Ares', 1, 3,'654000111', 'oveja@example.com', 'ACCEPTED', 1),
(2, 'Juan Manuel', 'Braza Benitez', 2, 2, '654000112', 'sheriff@example.com', 'ACCEPTED', 1),
(3, 'Juan Carlos', 'Aragon', 3, 3, '654000113', 'veneno@example.com', 'ACCEPTED', 2),
(4, 'Manolo', 'Santander', 3, 3, '654000114', 'viña@example.com', 'ACCEPTED', 2),
(5, 'Jesus', 'Bienvenido', 4, 4, '654000115', 'rata@example.com', 'ACCEPTED', 3),
(6, 'Antonio', 'Martin', 2, 2, '654000116', 'musa@example.com', 'ACCEPTED', 3),
(7, 'Jose', 'Guerrero', 1, 2, '654000117', 'yuyu@example.com', 'ACCEPTED', 4),
(8, 'Francisco', 'Alba', 3, 3, '654000118', 'caleta@example.com', 'ACCEPTED', 4),
(9, 'Kike', 'Remolino', 2, 2, '654000119', 'heavy@example.com', 'ACCEPTED', 5),
(10, 'Julio', 'Pardo', 1, 1, '654000110',  'opera@example.com', 'ACCEPTED', 5);

INSERT IGNORE INTO event_properties (id, event_id, other_service_id, venue_id, start_time, end_time, status, deposit_amount, price_per_service, book_date) VALUES
--user1
(1, 1, 3, null, '2026-12-31 13:00:00', '2026-12-31 22:00:00', 'APPROVED', 3600.00 * 0.35, 3600.0, '2025-02-12 22:00:00'),
(2, 1, 2, null, '2026-12-31 13:00:00', '2026-12-31 15:00:00', 'APPROVED', 600.00 * 0.35, 600.0, '2025-02-12 22:00:00'),
(3, 1, null, 1, '2026-12-31 12:00:00', '2026-12-31 23:00:00', 'APPROVED', 1500.00 * 0.35, 1500.0, '2025-02-12 22:00:00'),
--user2
(4, 2, 3, null, '2026-12-31 12:00:00', '2026-12-31 23:00:00', 'APPROVED', 4400.00 * 0.35, 4400.0, '2025-02-12 22:00:00'),
(5, 2, 4, null, '2026-12-31 13:00:00', '2026-12-31 15:00:00', 'APPROVED', 400.00 * 0.35, 400.0, '2025-02-12 22:00:00'),
(6, 2, 6, null, '2026-12-31 13:00:00', '2026-12-31 23:00:00', 'APPROVED', 200.00 * 0.35, 2000.0, '2025-02-12 22:00:00'),
(7, 2, null, 1, '2026-12-31 12:00:00', '2026-12-31 23:00:00', 'APPROVED', 1500.00 * 0.35, 1500.0, '2025-02-12 22:00:00'),
--user3
(8, 3, 3, null, '2026-12-31 14:00:00', '2026-12-31 22:00:00', 'APPROVED', 3200.00 * 0.35, 3200.0, '2025-02-12 22:00:00'),
(9, 3, 4, null, '2026-12-31 14:00:00', '2026-12-31 17:00:00', 'APPROVED', 600.00 * 0.35, 600.0, '2025-02-12 22:00:00'),
(10, 3, 6, null, '2026-12-31 14:00:00', '2026-12-31 23:00:00', 'APPROVED', 1800.00 * 0.35, 1800.0, '2025-02-12 22:00:00'),
(11, 3, null, 1, '2026-12-31 14:00:00', '2026-12-31 23:00:00', 'APPROVED', 1500.00 * 0.35, 1500.0, '2025-02-12 22:00:00'),
--user4
(12, 4, 4, null, '2026-12-31 12:00:00', '2026-12-31 14:00:00', 'APPROVED', 1600.00 * 0.35, 1600.0, '2025-02-12 22:00:00'),
(13, 4, 6, null, '2026-12-31 12:00:00', '2026-12-31 20:00:00', 'APPROVED', 400.00 * 0.35, 400.0, '2025-02-12 22:00:00'),
(14, 4, 2, null, '2026-12-31 12:00:00', '2026-12-31 14:00:00', 'APPROVED', 600.00 * 0.35, 600.0, '2025-02-12 22:00:00'),
(15, 4, null, 2, '2026-12-31 11:00:00', '2026-12-31 20:00:00', 'APPROVED', 3600.00 * 0.35, 3600.0, '2025-02-12 22:00:00'),
--user5
(16, 5, 2, null, '2026-12-31 13:00:00', '2026-12-31 15:00:00', 'APPROVED', 600.00 * 0.35, 600.0, '2025-02-12 22:00:00'),
(17, 5, 4, null, '2026-12-31 13:00:00', '2026-12-31 15:00:00', 'APPROVED', 400.00 * 0.35, 400.0, '2025-02-12 22:00:00'),
(18, 5, 6, null, '2026-12-31 13:00:00', '2026-12-31 23:00:00', 'APPROVED', 2000.00 * 0.35, 2000.0, '2025-02-12 22:00:00'),
(19, 5, null, 2, '2026-12-31 12:00:00', '2026-12-31 23:00:00', 'APPROVED', 4400.00 * 0.35, 4400.0, '2025-02-12 22:00:00'),
--user1
(20, 6, 3, null, '2026-06-30 13:00:00', '2026-06-30 22:00:00', 'APPROVED', 3600.00 * 0.35, 3600.0, '2025-02-12 22:00:00'),
(21, 6, 2, null, '2026-06-30 13:00:00', '2026-06-30 15:00:00', 'APPROVED', 600.00 * 0.35, 600.0, '2025-02-12 22:00:00'),
(22, 6, null, 1, '2026-06-30 12:00:00', '2026-06-30 23:00:00', 'APPROVED', 1500.00 * 0.35, 1500.0, '2025-02-12 22:00:00'),
--user2
(23, 7, 4, null, '2026-07-30 13:00:00', '2026-07-30 22:00:00', 'APPROVED', 800.00 * 0.35, 800.0, '2025-02-12 22:00:00'),
(24, 7, 3, null, '2026-07-30 13:00:00', '2026-07-30 15:00:00', 'APPROVED', 1800.00 * 0.35, 1800.0, '2025-02-12 22:00:00'),
(25, 7, null, 1, '2026-07-30 12:00:00', '2026-07-30 23:00:00', 'APPROVED', 1500.00 * 0.35, 1500.0, '2025-02-12 22:00:00'),
--user3
(26, 8, 4, null, '2026-08-30 13:00:00', '2026-08-30 15:00:00', 'APPROVED', 400.00 * 0.35, 400.0, '2025-02-12 22:00:00'),
(27, 8, 6, null, '2026-08-30 13:00:00', '2026-08-30 15:00:00', 'APPROVED', 400.00 * 0.35, 400.0, '2025-02-12 22:00:00'),
(28, 8, null, 1, '2026-08-30 12:00:00', '2026-08-30 23:00:00', 'APPROVED', 1500.00 * 0.35, 1500.0, '2025-02-12 22:00:00'),
--user4
(29, 9, 6, null, '2026-09-30 13:00:00', '2026-09-30 15:00:00', 'APPROVED', 400.00 * 0.35, 400.0, '2025-02-12 22:00:00'),
(30, 9, 3, null, '2026-09-30 13:00:00', '2026-09-30 15:00:00', 'APPROVED', 400.00 * 0.35, 400.0, '2025-02-12 22:00:00'),
(31, 9, null, 2, '2026-09-30 12:00:00', '2026-09-30 23:00:00', 'APPROVED', 4400.00 * 0.35, 4400.0, '2025-02-12 22:00:00'),
--user5
(32, 10, 3, null, '2026-10-30 13:00:00', '2026-10-30 17:00:00', 'APPROVED', 1600.00 * 0.35, 1600.0, '2025-02-12 22:00:00'),
(33, 10, 6, null, '2026-10-30 13:00:00', '2026-10-30 16:00:00', 'APPROVED', 600.00 * 0.35, 600.0, '2025-02-12 22:00:00'),
(34, 10, null, 2, '2026-10-30 12:00:00', '2026-10-30 23:00:00', 'APPROVED', 4400.00 * 0.35, 4400.0, '2025-02-12 22:00:00');

INSERT IGNORE INTO notifications (id, user_id, subject, message, type, created_at) VALUES 
(1, 2, 'Evento creado', 'Tu evento ha sido creado exitosamente.', 'EVENT_CREATED', '2025-02-12 22:00:00'),
(2, 14, 'Nueva solicitud de reserva', 'Has recibido una nueva reserva para uno de tus servicios, acepta o rechaza.', 'NEW_REQUEST', '2025-02-12 22:00:00');

INSERT IGNORE INTO  ratings (id, stars, comment, created_at, user_id, venue_id, other_service_id) VALUES
(1, 5, 'El lugar es increíble y el servicio fue excepcional.', '2025-02-12 22:00:00', 1, 1, null),
(2, 4, 'La comida estuvo buena pero el servicio un poco lento.', '2025-02-12 22:00:00', 2, null, 3),
(3, 1, 'No cumplió con mis expectativas.', '2025-02-12 22:00:00', 3, null, 4),
(4, 5, 'Todo perfecto!', '2025-02-12 22:00:00', 4, 2, null),
(5, 3.5, 'Buen servicio pero podría mejorar.', '2025-02-12 22:00:00', 5, null, 4),
(6, 5, 'El servicio fue excepcional.', '2025-02-12 22:00:00', 1, null, 2),
(7, 1.5, 'Servicio lento, raciones escasísimas. Mejillones al vapor secos y sin limpiar, además de haber mejillones contados, 13 para ser más exactos. Íbamos con las expectativas muy altas y decepción auténtica. El plato de ranas a la mitad… Por decir algo bueno, las cañas están bien tiradas', '2025-02-12 22:00:00', 2, 1, null),
(8, 3, 'Esperaba más.', '2025-02-12 22:00:00', 3, null, 3),
(9, 5, 'Excelente servicio.', '2025-02-12 22:00:00', 4, null, 6),
(10, 0, 'Camarero, hay una mosca en mi sopa!', '2025-02-12 22:00:00', 5, null, 2);

-- NUEVOS DATOS SIMULADOS (NO INTERFIEREN CON LOS DATOS EXISTENTES)

-- Additional USERS (clients and suppliers)
INSERT IGNORE INTO users (id, username, role, email, first_name, last_name, telephone, dni, profile_picture, password, plan, payment_plan_date, expire_plan_date, receives_emails) VALUES 
-- More clients
(20, 'CarmenRG', 'CLIENT', 'carmen.rodriguez@example.com', 'Carmen', 'Rodríguez García', '654789123', '12345678A', 'https://randomuser.me/api/portraits/women/22.jpg', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', null, null, null, true),
(21, 'JavierML', 'CLIENT', 'javier.martinez@example.com', 'Javier', 'Martínez López', '678912345', '23456789B', 'https://randomuser.me/api/portraits/men/33.jpg', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', null, null, null, false),
(22, 'LauraSF', 'CLIENT', 'laura.sanchez@example.com', 'Laura', 'Sánchez Fernández', '612345678', '34567890C', 'https://randomuser.me/api/portraits/women/44.jpg', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', null, null, null, true),
(23, 'MiguelPG', 'CLIENT', 'miguel.perez@example.com', 'Miguel', 'Pérez González', '623456789', '45678901D', 'https://randomuser.me/api/portraits/men/55.jpg', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', null, null, null, false),
(24, 'SofiaJR', 'CLIENT', 'sofia.jimenez@example.com', 'Sofía', 'Jiménez Ruiz', '634567890', '56789012E', 'https://randomuser.me/api/portraits/women/66.jpg', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', null, null, null, true),

-- More suppliers
(25, 'FloresDelSur', 'SUPPLIER', 'info@floresdelsur.com', 'Floristería', 'Del Sur', '954123456', '67890123F', 'https://cdn.pixabay.com/photo/2013/10/10/06/31/wedding-193519_1280.jpg', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', "PREMIUM", '2025-04-15', '2026-04-15', true),
(26, 'DulcesDelicias', 'SUPPLIER', 'contacto@dulcesdelicias.com', 'Pastelería', 'Dulces Delicias', '955234567', '78901234G', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', "BASIC", null, null, true),
(27, 'TransporteVIP', 'SUPPLIER', 'reservas@transportevip.com', 'Transporte', 'VIP', '956345678', '89012345H', 'https://images.unsplash.com/photo-1550355291-bbee04a92027', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', "PREMIUM", '2025-05-10', '2026-05-10', false),
(28, 'AnimacionFiestas', 'SUPPLIER', 'info@animacionfiestas.com', 'Animación', 'Fiestas', '957456789', '90123456I', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', "BASIC", null, null, true),
(29, 'InvitacionesElegantes', 'SUPPLIER', 'pedidos@invitacioneselegantes.com', 'Invitaciones', 'Elegantes', '958567890', '01234567J', 'https://cdn.pixabay.com/photo/2018/05/12/08/52/wedding-invitations-3392698_1280.jpg', '$2a$10$gyqEuh5bpJVhwuN44YwkjeaR6/1u2KqFTGhjYxWtH27Dmka569AmK', "PREMIUM", '2025-06-20', '2026-06-20', false);

-- Additional VENUES
INSERT IGNORE INTO venues (id, postal_code, coordinates, address, max_guests, surface, name, available, city_available, service_price_guest, service_price_hour, picture, description, user_id, limited_by_price_per_guest, limited_by_price_per_hour, fixed_price, earliest_time, latest_time) VALUES 
(8, '41003', '37.386123, -5.991234', 'Av. de la Constitución, 12', 300, 450.00, 'Palacio de Cristal', TRUE, 'Sevilla', null, 500.00, 'https://cdn.pixabay.com/photo/2022/01/10/04/37/event-6927353_1280.jpg', 'Elegante palacio con amplios salones y jardines para celebraciones exclusivas. Ubicado en el centro histórico de Sevilla, ofrece un entorno único con vistas panorámicas a la ciudad.', 25, FALSE, TRUE, null, '10:00:00', '02:00:00'),
(9, '41004', '37.392456, -5.984567', 'C/ Feria, 45', 150, 250.00, 'Casa Palacio Andaluza', TRUE, 'Sevilla', 55.00, null, 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3', 'Típica casa palacio andaluza con patio central, fuente y decoración tradicional. Ideal para eventos con encanto y sabor local.', 26, TRUE, FALSE, null, '11:00:00', '00:00:00'),
(10, '41005', '37.375678, -5.972345', 'Paseo de las Delicias, 78', 400, 800.00, 'Jardines del Guadalquivir', TRUE, 'Sevilla', null, null, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af', 'Espectaculares jardines a orillas del río Guadalquivir. Espacios al aire libre con posibilidad de carpas y estructuras temporales para grandes eventos.', 27, FALSE, FALSE, 3500.00, '09:00:00', '01:00:00'),
(11, '41006', '37.398765, -5.965432', 'C/ Sierpes, 23', 80, 120.00, 'Salón Dorado', TRUE, 'Sevilla', 65.00, null, 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3', 'Elegante salón con decoración clásica y dorados. Perfecto para celebraciones íntimas y exclusivas en pleno centro de Sevilla.', 28, TRUE, FALSE, null, '12:00:00', '23:00:00'),
(12, '41007', '37.405678, -5.958901', 'Av. de la Palmera, 56', 250, 350.00, 'Villa Los Naranjos', TRUE, 'Sevilla', null, 450.00, 'https://cdn.pixabay.com/photo/2021/04/26/17/37/germany-6209610_1280.jpg', 'Hermosa villa rodeada de naranjos y jardines. Cuenta con salones interiores y espacios exteriores para celebraciones durante todo el año.', 29, FALSE, TRUE, null, '10:00:00', '22:00:00');

-- Additional OTHER_SERVICES
INSERT IGNORE INTO other_services (id, other_service_type, extra_information, name, available, city_available, service_price_guest, service_price_hour, picture, description, user_id, limited_by_price_per_guest, limited_by_price_per_hour, fixed_price) VALUES
(8, 'DECORATION', 'Decoración floral completa.', 'Flores del Sur', TRUE, 'Sevilla', null, null, 'https://cdn.pixabay.com/photo/2017/04/28/10/20/flowers-2268020_1280.jpg', 'Creamos ambientes únicos con nuestras decoraciones florales personalizadas. Desde centros de mesa hasta arcos nupciales, transformamos cualquier espacio en un jardín de ensueño.', 25, FALSE, FALSE, 800.00),
(9, 'CATERING', 'Tartas y dulces personalizados.', 'Dulces Delicias', TRUE, 'Sevilla', 12.00, null, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587', 'Elaboramos tartas, cupcakes y mesas dulces personalizadas para todo tipo de eventos. Utilizamos ingredientes de primera calidad y diseños exclusivos adaptados a cada celebración.', 26, TRUE, FALSE, null),
(10, 'DECORATION', 'Decoraciones de coches, para tus fiestas.', 'Coches ferrari', TRUE, 'Sevilla', null, 120.00, 'https://images.unsplash.com/photo-1550355291-bbee04a92027', 'Decora tu fiesta con coches, imagenes y relacionados, perfecto para los aficionados a los coches.', 27, FALSE, TRUE, null),
(11, 'ENTERTAINMENT', 'Animación infantil y para adultos.', 'Animación Fiestas', TRUE, 'Sevilla', 8.00, null, 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7', 'Hacemos que tu evento sea divertido para todos los asistentes. Ofrecemos servicios de animación infantil, magos, músicos, bailarines y actividades para adultos adaptadas a cada celebración.', 28, TRUE, FALSE, null),
(12, 'DECORATION', 'Invitaciones y papelería personalizada.', 'Invitaciones Elegantes', TRUE, 'Sevilla', null, null, 'https://cdn.pixabay.com/photo/2016/10/22/07/13/wedding-1760024_1280.jpg', 'Diseñamos y elaboramos invitaciones, minutas, seating plans y toda la papelería necesaria para tu evento. Cada diseño es único y personalizado según tus gustos y la temática de la celebración.', 29, FALSE, FALSE, 350.00);

-- Additional EVENTS
INSERT IGNORE INTO events (id, event_type, guests, event_date, payment_date, confirmed_guests, paid, user_id, name) VALUES
(11, 'WEDDING', 180, '2026-05-15', '2026-01-15', 165, TRUE, 20, "Boda de Carmen y Alberto"),
(12, 'CHRISTENING', 70, '2026-06-20', '2026-03-20', 65, TRUE, 21, "Bautizo de Lucía"),
(13, 'COMMUNION', 90, '2026-05-10', '2026-02-10', 85, TRUE, 22, "Comunión de Martín"),
(14, 'WEDDING', 250, '2026-07-18', '2026-03-18', 230, TRUE, 23, "Boda de Miguel y Elena"),
(15, 'CHRISTENING', 60, '2026-08-22', '2026-05-22', 55, TRUE, 24, "Bautizo de Daniel"),
(16, 'COMMUNION', 120, '2026-05-30', '2026-02-28', 110, TRUE, 20, "Comunión de Sara"),
(17, 'WEDDING', 300, '2026-09-12', '2026-05-12', 280, TRUE, 21, "Boda de Javier y Cristina"),
(18, 'CHRISTENING', 80, '2026-10-17', '2026-07-17', 75, TRUE, 22, "Bautizo de Pablo"),
(19, 'COMMUNION', 100, '2026-05-23', '2026-02-23', 95, TRUE, 23, "Comunión de Laura"),
(20, 'WEDDING', 220, '2026-11-14', '2026-07-14', 200, TRUE, 24, "Boda de Sofía y Alejandro");

-- Additional INVITATIONS
INSERT IGNORE INTO invitations (id, first_name, last_name, number_of_guests, max_guests, telephone, email, invitation_type, event_id) VALUES
(11, 'Roberto', 'García Fernández', 2, 2, '654111222', 'roberto.garcia@example.com', 'ACCEPTED', 11),
(12, 'Lucía', 'Martínez Sánchez', 3, 3, '654222333', 'lucia.martinez@example.com', 'ACCEPTED', 11),
(13, 'Carlos', 'López Rodríguez', 2, 2, '654333444', 'carlos.lopez@example.com', 'ACCEPTED', 12),
(14, 'Ana', 'González Pérez', 4, 4, '654444555', 'ana.gonzalez@example.com', 'ACCEPTED', 12),
(15, 'David', 'Fernández Ruiz', 3, 3, '654555666', 'david.fernandez@example.com', 'ACCEPTED', 13),
(16, 'Elena', 'Sánchez Martín', 2, 2, '654666777', 'elena.sanchez@example.com', 'ACCEPTED', 13),
(17, 'Javier', 'Rodríguez García', 1, 2, '654777888', 'javier.rodriguez@example.com', 'ACCEPTED', 14),
(18, 'María', 'Pérez López', 3, 3, '654888999', 'maria.perez@example.com', 'ACCEPTED', 14),
(19, 'Pedro', 'Martín González', 2, 2, '654999000', 'pedro.martin@example.com', 'ACCEPTED', 15),
(20, 'Laura', 'Ruiz Fernández', 1, 1, '654000999', 'laura.ruiz@example.com', 'ACCEPTED', 15),
(21, 'Miguel', 'García Sánchez', 2, 2, '654111000', 'miguel.garcia@example.com', 'ACCEPTED', 16),
(22, 'Cristina', 'López Martínez', 3, 3, '654222111', 'cristina.lopez@example.com', 'ACCEPTED', 16),
(23, 'Alejandro', 'González Rodríguez', 4, 4, '654333222', 'alejandro.gonzalez@example.com', 'ACCEPTED', 17),
(24, 'Sofía', 'Fernández Pérez', 2, 2, '654444333', 'sofia.fernandez@example.com', 'ACCEPTED', 17),
(25, 'Daniel', 'Sánchez García', 3, 3, '654555444', 'daniel.sanchez@example.com', 'ACCEPTED', 18),
(26, 'Paula', 'Martín López', 2, 2, '654666555', 'paula.martin@example.com', 'ACCEPTED', 18),
(27, 'Pablo', 'Rodríguez Fernández', 1, 2, '654777666', 'pablo.rodriguez@example.com', 'ACCEPTED', 19),
(28, 'Carmen', 'Pérez González', 3, 3, '654888777', 'carmen.perez@example.com', 'ACCEPTED', 19),
(29, 'Alberto', 'Martín Sánchez', 2, 2, '654999888', 'alberto.martin@example.com', 'ACCEPTED', 20),
(30, 'Lucía', 'Ruiz Rodríguez', 1, 1, '654000111', 'lucia.ruiz@example.com', 'ACCEPTED', 20);

-- Additional EVENT_PROPERTIES
INSERT IGNORE INTO event_properties (id, event_id, other_service_id, venue_id, start_time, end_time, status, deposit_amount, price_per_service, book_date) VALUES
-- Event 11 (Carmen's Wedding)
(35, 11, 8, null, '2026-05-15 12:00:00', '2026-05-15 22:00:00', 'APPROVED', 800.00 * 0.35, 800.0, '2025-05-15 10:00:00'),
(36, 11, 9, null, '2026-05-15 12:00:00', '2026-05-15 22:00:00', 'APPROVED', 2160.00 * 0.35, 2160.0, '2025-05-15 10:00:00'),
(37, 11, 10, null, '2026-05-15 11:00:00', '2026-05-15 13:00:00', 'APPROVED', 240.00 * 0.35, 240.0, '2025-05-15 10:00:00'),
(38, 11, null, 8, '2026-05-15 11:00:00', '2026-05-15 23:00:00', 'APPROVED', 6000.00 * 0.35, 6000.0, '2025-05-15 10:00:00'),

-- Event 12 (Lucía's Christening)
(39, 12, 8, null, '2026-06-20 11:00:00', '2026-06-20 18:00:00', 'APPROVED', 800.00 * 0.35, 800.0, '2025-06-20 10:00:00'),
(40, 12, 9, null, '2026-06-20 11:00:00', '2026-06-20 18:00:00', 'APPROVED', 840.00 * 0.35, 840.0, '2025-06-20 10:00:00'),
(41, 12, 11, null, '2026-06-20 12:00:00', '2026-06-20 16:00:00', 'APPROVED', 560.00 * 0.35, 560.0, '2025-06-20 10:00:00'),
(42, 12, null, 9, '2026-06-20 11:00:00', '2026-06-20 18:00:00', 'APPROVED', 3850.00 * 0.35, 3850.0, '2025-06-20 10:00:00'),

-- Event 13 (Martín's Communion)
(43, 13, 9, null, '2026-05-10 12:00:00', '2026-05-10 19:00:00', 'APPROVED', 1080.00 * 0.35, 1080.0, '2025-05-10 10:00:00'),
(44, 13, 11, null, '2026-05-10 12:00:00', '2026-05-10 17:00:00', 'APPROVED', 720.00 * 0.35, 720.0, '2025-05-10 10:00:00'),
(45, 13, 12, null, '2026-05-10 12:00:00', '2026-05-10 19:00:00', 'APPROVED', 350.00 * 0.35, 350.0, '2025-05-10 10:00:00'),
(46, 13, null, 10, '2026-05-10 11:00:00', '2026-05-10 20:00:00', 'APPROVED', 3500.00 * 0.35, 3500.0, '2025-05-10 10:00:00'),

-- Event 14 (Miguel's Wedding)
(47, 14, 8, null, '2026-07-18 13:00:00', '2026-07-18 23:00:00', 'APPROVED', 800.00 * 0.35, 800.0, '2025-07-18 10:00:00'),
(48, 14, 9, null, '2026-07-18 13:00:00', '2026-07-18 23:00:00', 'APPROVED', 3000.00 * 0.35, 3000.0, '2025-07-18 10:00:00'),
(49, 14, 10, null, '2026-07-18 12:00:00', '2026-07-18 14:00:00', 'APPROVED', 240.00 * 0.35, 240.0, '2025-07-18 10:00:00'),
(50, 14, null, 10, '2026-07-18 12:00:00', '2026-07-18 00:00:00', 'APPROVED', 3500.00 * 0.35, 3500.0, '2025-07-18 10:00:00'),

-- Event 15 (Daniel's Christening)
(51, 15, 8, null, '2026-08-22 11:00:00', '2026-08-22 18:00:00', 'APPROVED', 800.00 * 0.35, 800.0, '2025-08-22 10:00:00'),
(52, 15, 9, null, '2026-08-22 11:00:00', '2026-08-22 18:00:00', 'APPROVED', 720.00 * 0.35, 720.0, '2025-08-22 10:00:00'),
(53, 15, 11, null, '2026-08-22 12:00:00', '2026-08-22 16:00:00', 'APPROVED', 480.00 * 0.35, 480.0, '2025-08-22 10:00:00'),
(54, 15, null, 11, '2026-08-22 11:00:00', '2026-08-22 18:00:00', 'APPROVED', 3900.00 * 0.35, 3900.0, '2025-08-22 10:00:00'),

-- Event 16 (Sara's Communion)
(55, 16, 9, null, '2026-05-30 12:00:00', '2026-05-30 19:00:00', 'APPROVED', 1440.00 * 0.35, 1440.0, '2025-05-30 10:00:00'),
(56, 16, 11, null, '2026-05-30 12:00:00', '2026-05-30 17:00:00', 'APPROVED', 960.00 * 0.35, 960.0, '2025-05-30 10:00:00'),
(57, 16, 12, null, '2026-05-30 12:00:00', '2026-05-30 19:00:00', 'APPROVED', 350.00 * 0.35, 350.0, '2025-05-30 10:00:00'),
(58, 16, null, 12, '2026-05-30 11:00:00', '2026-05-30 20:00:00', 'APPROVED', 4050.00 * 0.35, 4050.0, '2025-05-30 10:00:00'),

-- Event 17 (Javier's Wedding)
(59, 17, 8, null, '2026-09-12 13:00:00', '2026-09-12 23:00:00', 'APPROVED', 800.00 * 0.35, 800.0, '2025-09-12 10:00:00'),
(60, 17, 9, null, '2026-09-12 13:00:00', '2026-09-12 23:00:00', 'APPROVED', 3600.00 * 0.35, 3600.0, '2025-09-12 10:00:00'),
(61, 17, 10, null, '2026-09-12 12:00:00', '2026-09-12 14:00:00', 'APPROVED', 240.00 * 0.35, 240.0, '2025-09-12 10:00:00'),
(62, 17, null, 8, '2026-09-12 12:00:00', '2026-09-12 00:00:00', 'APPROVED', 6000.00 * 0.35, 6000.0, '2025-09-12 10:00:00'),

-- Event 18 (Pablo's Christening)
(63, 18, 8, null, '2026-10-17 11:00:00', '2026-10-17 18:00:00', 'APPROVED', 800.00 * 0.35, 800.0, '2025-10-17 10:00:00'),
(64, 18, 9, null, '2026-10-17 11:00:00', '2026-10-17 18:00:00', 'APPROVED', 960.00 * 0.35, 960.0, '2025-10-17 10:00:00'),
(65, 18, 11, null, '2026-10-17 12:00:00', '2026-10-17 16:00:00', 'APPROVED', 640.00 * 0.35, 640.0, '2025-10-17 10:00:00'),
(66, 18, null, 9, '2026-10-17 11:00:00', '2026-10-17 18:00:00', 'APPROVED', 4400.00 * 0.35, 4400.0, '2025-10-17 10:00:00'),

-- Event 19 (Laura's Communion)
(67, 19, 9, null, '2026-05-23 12:00:00', '2026-05-23 19:00:00', 'APPROVED', 1200.00 * 0.35, 1200.0, '2025-05-23 10:00:00'),
(68, 19, 11, null, '2026-05-23 12:00:00', '2026-05-23 17:00:00', 'APPROVED', 800.00 * 0.35, 800.0, '2025-05-23 10:00:00'),
(69, 19, 12, null, '2026-05-23 12:00:00', '2026-05-23 19:00:00', 'APPROVED', 350.00 * 0.35, 350.0, '2025-05-23 10:00:00'),
(70, 19, null, 11, '2026-05-23 11:00:00', '2026-05-23 20:00:00', 'APPROVED', 6500.00 * 0.35, 6500.0, '2025-05-23 10:00:00'),

-- Event 20 (Sofía's Wedding)
(71, 20, 8, null, '2026-11-14 13:00:00', '2026-11-14 23:00:00', 'APPROVED', 800.00 * 0.35, 800.0, '2025-11-14 10:00:00'),
(72, 20, 9, null, '2026-11-14 13:00:00', '2026-11-14 23:00:00', 'APPROVED', 2640.00 * 0.35, 2640.0, '2025-11-14 10:00:00'),
(73, 20, 10, null, '2026-11-14 12:00:00', '2026-11-14 14:00:00', 'APPROVED', 240.00 * 0.35, 240.0, '2025-11-14 10:00:00'),
(74, 20, null, 12, '2026-11-14 12:00:00', '2026-11-14 22:00:00', 'APPROVED', 4500.00 * 0.35, 4500.0, '2025-11-14 10:00:00');

-- Additional NOTIFICATIONS
INSERT IGNORE INTO notifications (id, user_id, subject, message, type, created_at) VALUES 
(4, 21, 'Pago pendiente', 'Tienes un pago pendiente para tu evento "Bautizo de Lucía". Por favor, completa el pago antes de la fecha límite.', 'PAYMENT_REMINDER', '2026-03-01 09:30:00'),
(7, 24, 'Nuevo mensaje', 'Has recibido un nuevo mensaje del proveedor "Flores del Sur" sobre tu evento.', 'NEW_MESSAGE', '2025-05-25 16:10:00'),
(8, 25, 'Nueva solicitud de reserva', 'Has recibido una nueva solicitud de reserva para decoración floral.', 'NEW_REQUEST', '2025-06-10 08:30:00');
