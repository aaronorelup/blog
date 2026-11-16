// TuxGuitar 1.5.6 format plugins used headless (no GUI): read a Guitar Pro file with TuxGuitar's own readers, print
// what the song model holds as JSON (tracks, tuning, capo offset, notes with string, fret and onset), and write it
// back with every writer plugin that can run without the GUI.
// Build: javac -cp "/usr/share/tuxguitar/lib/*:/usr/share/tuxguitar/plugins/*" -d <classes> TGConvert.java
// Run:   java -Djava.awt.headless=true -cp "<classes>:/usr/share/tuxguitar/lib/*:/usr/share/tuxguitar/plugins/*:/usr/share/java/commons-compress.jar" TGConvert <in> <outdir> <tag>
import java.io.*;
import java.util.*;
import org.herac.tuxguitar.io.base.*;
import org.herac.tuxguitar.io.gtp.*;
import org.herac.tuxguitar.song.factory.TGFactory;
import org.herac.tuxguitar.song.models.*;

public class TGConvert {
    static TGSong read(String path) throws Exception {
        String p = path.toLowerCase();
        TGSongReader reader;
        if (p.endsWith(".gp5")) reader = new GP5InputStream(new GTPSettings());
        else if (p.endsWith(".gp4")) reader = new GP4InputStream(new GTPSettings());
        else if (p.endsWith(".gp3")) reader = new GP3InputStream(new GTPSettings());
        else if (p.endsWith(".gpx")) reader = new org.herac.tuxguitar.io.gpx.v6.GPXInputStream();
        else if (p.endsWith(".gp")) reader = new org.herac.tuxguitar.io.gpx.v7.GPXInputStream();
        else if (p.endsWith(".mid") || p.endsWith(".midi")) reader = new org.herac.tuxguitar.io.midi.MidiSongReader();
        else throw new IllegalArgumentException("no reader for " + path);
        TGSongReaderHandle h = new TGSongReaderHandle();
        h.setFactory(new TGFactory());
        h.setInputStream(new BufferedInputStream(new FileInputStream(path)));
        h.setContext(new TGSongStreamContext());
        reader.read(h);
        return h.getSong();
    }

    static String dump(TGSong song) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\"name\":").append(q(song.getName())).append(",\"tracks\":[");
        for (int t = 0; t < song.countTracks(); t++) {
            TGTrack track = song.getTrack(t);
            if (t > 0) sb.append(",");
            sb.append("{\"name\":").append(q(track.getName())).append(",\"offset_capo\":").append(track.getOffset());
            sb.append(",\"strings\":[");
            for (int i = 0; i < track.getStrings().size(); i++) {
                TGString s = track.getStrings().get(i);
                sb.append(i > 0 ? "," : "").append("[").append(s.getNumber()).append(",").append(s.getValue()).append("]");
            }
            sb.append("],\"measures\":").append(track.countMeasures()).append(",\"notes\":[");
            boolean first = true;
            // seconds from TuxGuitar ticks (960 per quarter) and each measure header's tempo
            double secAtMeasure = 0;
            long prevStart = -1; double prevTempo = 120;
            for (int m = 0; m < track.countMeasures(); m++) {
                TGMeasure meas = track.getMeasure(m);
                TGMeasureHeader hd = meas.getHeader();
                if (prevStart >= 0) secAtMeasure += (hd.getStart() - prevStart) / 960.0 * 60.0 / prevTempo;
                prevStart = hd.getStart(); prevTempo = hd.getTempo().getValue();
                for (int b = 0; b < meas.countBeats(); b++) {
                    TGBeat beat = meas.getBeat(b);
                    for (int v = 0; v < beat.countVoices(); v++) {
                        TGVoice voice = beat.getVoice(v);
                        if (voice.isEmpty()) continue;
                        for (TGNote n : voice.getNotes()) {
                            if (n.isTiedNote()) continue;
                            int open = track.getString(n.getString()).getValue();
                            double onset = secAtMeasure + (beat.getStart() - hd.getStart()) / 960.0 * 60.0 / prevTempo;
                            sb.append(first ? "" : ",");
                            first = false;
                            sb.append(String.format(Locale.ROOT,
                                "{\"measure\":%d,\"voice\":%d,\"onset\":%.6f,\"string\":%d,\"fret\":%d,\"pitch\":%d,\"velocity\":%d}",
                                m, v, onset, n.getString(), n.getValue(), open + n.getValue() + track.getOffset(), n.getVelocity()));
                        }
                    }
                }
            }
            sb.append("]}");
        }
        return sb.append("]}").toString();
    }

    static String q(String s) { return s == null ? "null" : "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"") + "\""; }

    static String write(TGSong song, TGSongWriter w, String out) {
        long t0 = System.nanoTime();
        try (OutputStream os = new BufferedOutputStream(new FileOutputStream(out))) {
            TGSongWriterHandle h = new TGSongWriterHandle();
            h.setFactory(new TGFactory());
            h.setSong(song);
            h.setOutputStream(os);
            h.setContext(new TGSongStreamContext());
            w.write(h);
        } catch (Throwable e) {
            return "FAILED " + e.getClass().getSimpleName() + ": " + String.valueOf(e.getMessage()).replace("\n", " ");
        }
        return "ok " + new File(out).length() + " bytes " + (System.nanoTime() - t0) / 1000000 + " ms";
    }

    public static void main(String[] a) throws Exception {
        String in = a[0], dir = a[1], tag = a[2];
        long t0 = System.nanoTime();
        TGSong song = read(in);
        System.err.println("read " + in + " in " + (System.nanoTime() - t0) / 1000000 + " ms");
        try (PrintWriter pw = new PrintWriter(new File(dir, tag + ".tuxguitar.json"), "UTF-8")) { pw.print(dump(song)); }
        Map<String, TGSongWriter> ws = new LinkedHashMap<>();
        ws.put(tag + ".tg.gp5", new GP5OutputStream(new GTPSettings()));
        ws.put(tag + ".tg.gp4", new GP4OutputStream(new GTPSettings()));
        ws.put(tag + ".tg.gp3", new GP3OutputStream(new GTPSettings()));
        ws.put(tag + ".tg.musicxml", new org.herac.tuxguitar.io.musicxml.MusicXMLSongWriter());
        ws.put(tag + ".tg.ascii.txt", new org.herac.tuxguitar.io.ascii.ASCIISongWriter());
        ws.put(tag + ".tg.ly", new org.herac.tuxguitar.io.lilypond.LilypondSongWriter());
        ws.put(tag + ".tg.mid", new org.herac.tuxguitar.io.midi.MidiSongWriter());
        for (Map.Entry<String, TGSongWriter> e : ws.entrySet())
            System.out.println(e.getKey() + ": " + write(song, e.getValue(), new File(dir, e.getKey()).getPath()));
    }
}
